import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { generateOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const purpose = (body.purpose === "reset" ? "reset" : "register") as "register" | "reset";

    if (!email || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Check user existence based on purpose
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (purpose === "register" && existing.length > 0) {
      return Response.json(
        { error: "An account with this email already exists. Please log in instead." },
        { status: 400 }
      );
    }

    if (purpose === "reset" && existing.length === 0) {
      return Response.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    const { code, expiresAt, isSimulated } = generateOtp(email, purpose);

    // If simulated (dev / preview / no SMTP configured), return code in payload and logs
    return Response.json({
      ok: true,
      message: isSimulated
        ? `Verification code sent! (Demo preview code: ${code})`
        : "Verification code sent to your email.",
      code: isSimulated ? code : undefined,
      isSimulated,
      expiresAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send verification code.";
    return Response.json({ error: message }, { status: 500 });
  }
}
