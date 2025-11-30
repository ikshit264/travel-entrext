import { NextRequest, NextResponse } from "next/server";
import { requireAuth, createToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/utils/validators";
import { encryptApiKey, validateGeminiKeyFormat } from "@/lib/crypto";

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Transform user object to hide key but indicate presence
    const { encryptedGeminiKey, ...safeUser } = user as any;
    return NextResponse.json({ 
      user: {
        ...safeUser,
        hasApiKey: !!encryptedGeminiKey
      } 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const validated = onboardingSchema.parse(body);

    if (validated.homeCity && validated.homeCountry) {
      const { getCities } = await import("@/lib/external-api");
      const cities = await getCities(validated.homeCountry);
      if (!cities.includes(validated.homeCity)) {
        return NextResponse.json(
          { error: "Invalid input — please choose from the list." },
          { status: 400 }
        );
      }
    }

    // Ensure Gemini Key is either present in DB or being updated
    if (!validated.geminiApiKey) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { encryptedGeminiKey: true },
      });

      if (!dbUser?.encryptedGeminiKey) {
        return NextResponse.json(
          { error: "Gemini API Key is required" },
          { status: 400 }
        );
      }
    }

    // Handle Gemini API Key encryption
    let encryptedGeminiKey: string | undefined;
    if (validated.geminiApiKey) {
      // Validate the key format
      if (!validateGeminiKeyFormat(validated.geminiApiKey)) {
        return NextResponse.json(
          { error: "Invalid Gemini API key format" },
          { status: 400 }
        );
      }
      // Encrypt the key
      encryptedGeminiKey = encryptApiKey(validated.geminiApiKey);
    }

    // Remove homeCountry and geminiApiKey from data to save
    const { homeCountry, geminiApiKey, ...dataToSave } = validated;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...dataToSave,
        ...(encryptedGeminiKey && { encryptedGeminiKey }),
        onboardingComplete: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        onboardingComplete: true,
        homeCity: true,
        travelStyle: true,
        budgetComfort: true,
        accommodationStyle: true,
        transportPreferences: true,
        emotionalBaseline: true,
        preferences: true,
        personality: true,
        baselineMood: true,
        encryptedGeminiKey: true,
      },
    });

    // Refresh the auth token to update the hasKey status
    const token = await createToken({ 
      userId: updatedUser.id,
      hasKey: !!updatedUser.encryptedGeminiKey 
    });
    
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Remove sensitive data before returning
    const { encryptedGeminiKey: _, ...userResponse } = updatedUser;

    return NextResponse.json({ user: userResponse });
  } catch (error: any) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
