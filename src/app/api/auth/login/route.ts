import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const next = String(body.next ?? "/dashboard");

    if (!email || !password) {
      return Response.json({ error: "Please enter your email and password." }, { status: 400 });
    }

    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = found[0];

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await createSession(user.id);
    return Response.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
      redirectUrl: next,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return Response.json({ error: message }, { status: 500 });
  }
}
