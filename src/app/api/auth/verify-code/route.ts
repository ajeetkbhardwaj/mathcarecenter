import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();
    const purpose = body.purpose as "register" | "reset" | undefined;

    if (!email || !code) {
      return Response.json({ error: "Email and verification code are required." }, { status: 400 });
    }

    const result = verifyOtp(email, code, purpose);
    if (!result.valid) {
      return Response.json({ error: result.error || "Invalid verification code." }, { status: 400 });
    }

    return Response.json({ ok: true, message: "Email successfully verified." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification error";
    return Response.json({ error: message }, { status: 500 });
  }
}
