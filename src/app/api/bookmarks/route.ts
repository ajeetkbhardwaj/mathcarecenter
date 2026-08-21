import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, anonymous: true });

  const body = (await request.json()) as { lessonSlug?: string; bookmarked?: boolean };
  if (!body.lessonSlug) return Response.json({ ok: false }, { status: 400 });

  if (body.bookmarked) {
    await db
      .insert(bookmarks)
      .values({ userId: user.id, lessonSlug: body.lessonSlug })
      .onConflictDoNothing();
  } else {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.lessonSlug, body.lessonSlug)));
  }

  return Response.json({ ok: true });
}
