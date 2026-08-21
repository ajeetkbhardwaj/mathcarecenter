import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? email.split("@")[0] ?? "Math Explorer").trim();
    const next = String(body.next ?? "/dashboard");

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email is required." }, { status: 400 });
    }

    // Find existing user or insert new one
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let user = existing[0];

    if (!user) {
      const inserted = await db
        .insert(users)
        .values({
          name: name || "Math Explorer",
          email,
          passwordHash: "oauth_or_supabase_managed",
          role: "student",
          plan: "free",
        })
        .returning();
      user = inserted[0] ?? { id: Date.now(), name, email };
    }

    // Create session cookie
    await createSession(user.id);

    return Response.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
      redirectUrl: next,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync session error";
    return Response.json({ error: message }, { status: 500 });
  }
}
