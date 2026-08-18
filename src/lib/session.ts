import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "pl_bet_session";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year — small trusted group, no expiry pressure

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

function sign(userId: string): string {
  return crypto.createHmac("sha256", getSecret()).update(userId).digest("hex");
}

function encode(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

function decode(value: string): string | null {
  const dotIndex = value.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const userId = value.slice(0, dotIndex);
  const signature = value.slice(dotIndex + 1);
  const expected = sign(userId);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  return userId;
}

export async function setSessionUser(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encode(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export class SessionRequiredError extends Error {
  constructor() {
    super("No active session");
    this.name = "SessionRequiredError";
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new SessionRequiredError();
  }
  return user;
}
