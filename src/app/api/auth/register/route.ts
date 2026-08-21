import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const code = String(body.code ?? "").trim();
    const next = String(body.next ?? "/dashboard");

    if (name.length < 2) {
      return Response.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Verify OTP code if passed
    if (code) {
      const otpCheck = verifyOtp(email, code, "register");
      if (!otpCheck.valid) {
        return Response.json({ error: otpCheck.error || "Invalid or expired verification code." }, { status: 400 });
      }
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return Response.json({ error: "An account with that email already exists. Please log in." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const inserted = await db
      .insert(users)
      .values({ name, email, passwordHash, role: "student", plan: "free" })
      .returning({ id: users.id, name: users.name, email: users.email });

    const user = inserted[0] ?? { id: Date.now(), name, email };
    await createSession(user.id);
    return Response.json({ ok: true, user: { id: user.id, name: user.name, email: user.email }, redirectUrl: next });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration error";
    return Response.json({ error: message }, { status: 500 });
  }
}
