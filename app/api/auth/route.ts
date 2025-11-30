import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema, loginSchema } from "@/utils/validators";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "signup") {
      const validated = signupSchema.parse(body);
      
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }

      const user = await prisma.user.create({
        data: {
          email: validated.email,
          password: validated.password,
          name: validated.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          onboardingComplete: true,
        },
      });

      const token = await createToken({ 
        userId: user.id,
        hasKey: false // New users don't have a key yet
      });
      
      const cookieStore = await cookies();
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({ user });
    }

    if (action === "login") {
      const validated = loginSchema.parse(body);
      
      const user = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (!user || user.password !== validated.password) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = await createToken({ 
        userId: user.id,
        hasKey: !!user.encryptedGeminiKey
      });
      
      const cookieStore = await cookies();
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete,
        },
      });
    }

    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("auth-token");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
