import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();
    const newPassword = String(body.newPassword ?? "");
    const next = String(body.next ?? "/dashboard");

    if (!email || !code || !newPassword) {
      return Response.json(
        { error: "Email, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpResult = verifyOtp(email, code, "reset");
    if (!otpResult.valid) {
      return Response.json({ error: otpResult.error || "Invalid or expired code." }, { status: 400 });
    }

    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = found[0];
    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    const newHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));

    // Auto-login user
    await createSession(user.id);

    return Response.json({
      ok: true,
      message: "Password updated successfully.",
      redirectUrl: next,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Password reset failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
