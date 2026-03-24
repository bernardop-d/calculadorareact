import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        ageVerified: true,
        avatarUrl: true,
        bio: true,
        subscription: {
          select: {
            status: true,
            planTier: true,
            stripePriceId: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    return user;
  } catch {
    return null;
  }
}

export function isSubscriptionActive(status: string | undefined): boolean {
  return status === "ACTIVE";
}

export function getSubscriptionTier(
  stripePriceId: string | undefined
): "BASIC" | "PREMIUM" | null {
  if (!stripePriceId) return null;
  if (stripePriceId === process.env.STRIPE_PRICE_ID_BASIC) return "BASIC";
  return "PREMIUM";
}
