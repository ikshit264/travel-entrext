import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function createToken(payload: { userId: string; hasKey: boolean }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; hasKey: boolean };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  
  if (!token) return null;
  
  const payload = await verifyToken(token);
  return payload;
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      onboardingComplete: true,
      homeCity: true,
      homeCountry: true,
      travelStyle: true,
      budgetComfort: true,
      accommodationStyle: true,
      transportPreferences: true,
      emotionalBaseline: true,
      preferences: true,
      personality: true,
      baselineMood: true,
      encryptedGeminiKey: true,
      createdAt: true,
    },
  });
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}
