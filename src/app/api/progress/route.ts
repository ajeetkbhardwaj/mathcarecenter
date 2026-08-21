import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, anonymous: true });

  const body = (await request.json()) as { lessonId?: number; completed?: boolean };
  if (!body.lessonId) return Response.json({ ok: false }, { status: 400 });

  if (body.completed) {
    await db
      .insert(lessonProgress)
      .values({ userId: user.id, lessonId: body.lessonId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(lessonProgress)
      .where(
        and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, body.lessonId)),
      );
  }

  return Response.json({ ok: true });
}
