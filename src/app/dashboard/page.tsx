import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, Bookmark, CheckCircle2, Flame, TrendingUp } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, courses, enrollments, lessonProgress, lessons } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { cn, initialsOf } from "@/lib/utils";
import { pageHref, type CollectionKey } from "@/lib/content";

export const metadata: Metadata = { title: "Student Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  await ensureSeeded();

  const [myEnrollments, progressRows, bookmarkRows, courseRows] = await Promise.all([
    db.select().from(enrollments).where(eq(enrollments.userId, user.id)).orderBy(desc(enrollments.createdAt)),
    db.select().from(lessonProgress).where(eq(lessonProgress.userId, user.id)),
    db.select().from(bookmarks).where(eq(bookmarks.userId, user.id)).orderBy(desc(bookmarks.createdAt)),
    db.select().from(courses).orderBy(courses.sortOrder),
  ]);

  const lessonRows = await db.select().from(lessons);
  const lessonById = new Map(lessonRows.map((l) => [l.id, l]));

  const enrolledCourseIds = new Set(myEnrollments.map((e) => e.courseId));
  const accessible = new Set([...enrolledCourseIds, ...courseRows.map((c) => c.id)]);

  const totalLessons = lessonRows.length;
  const completed = progressRows.length;
  const pct = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);

  const recent = [...progressRows]
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .slice(0, 5);

  const stats = [
    { icon: <CheckCircle2 className="size-4" />, label: "Lessons completed", value: String(completed), accent: "var(--accent-emerald)" },
    { icon: <BookOpen className="size-4" />, label: "Courses enrolled", value: String(myEnrollments.length), accent: "var(--accent-blue)" },
    { icon: <Flame className="size-4" />, label: "Saved bookmarks", value: String(bookmarkRows.length), accent: "var(--accent-amber)" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center gap-5">
        <span className="grid size-14 place-items-center rounded-2xl border border-line bg-surface text-[18px] font-bold">
          {initialsOf(user.name)}
        </span>
        <div className="min-w-0">
          <h1 className="text-[clamp(1.7rem,3.6vw,2.3rem)] leading-tight font-bold tracking-[-0.035em]">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[14px] text-muted">{user.email}</p>
        </div>
        <div className="ml-auto hidden sm:block">
          <Link
            href="/courses"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-[13.5px] font-semibold transition-colors hover:border-line-strong"
          >
            Browse Courses
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
            <span className="mb-3 inline-grid size-9 place-items-center rounded-xl border border-line bg-background" style={{ color: s.accent }}>
              {s.icon}
            </span>
            <p className="text-[26px] leading-none font-bold tracking-[-0.03em]">{s.value}</p>
            <p className="mt-1.5 text-[12.5px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Curriculum Progress
            </p>
            <p className="mt-1.5 text-[22px] font-bold tracking-[-0.03em]">
              {pct}% Completed
            </p>
          </div>
          <TrendingUp className="size-5 text-[var(--accent-emerald)]" />
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-[var(--accent-blue)] transition-[width] duration-500"
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
        <p className="mt-3 text-[12.5px] text-muted">
          {completed} of {totalLessons} total lessons completed.
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-[17px] font-bold tracking-[-0.025em]">Enrolled Courses</h2>
          <div className="grid gap-2">
            {courseRows
              .filter((c) => accessible.has(c.id))
              .map((c) => {
                const courseLessons = lessonRows.filter((l) => l.courseId === c.id);
                const done = courseLessons.filter((l) => progressRows.some((p) => p.lessonId === l.id)).length;
                const ratio = courseLessons.length === 0 ? 0 : Math.round((done / courseLessons.length) * 100);
                return (
                  <Link
                    key={c.id}
                    href={`/courses/${c.slug}`}
                    className="rounded-xl border border-line bg-surface px-4 py-3.5 transition-colors hover:border-line-strong shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[20px]">{c.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold">{c.title}</span>
                        <span className="block text-[12px] text-muted">
                          {done}/{courseLessons.length} lessons
                        </span>
                      </span>
                      <span className="font-mono text-[12px] text-muted">{ratio}%</span>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={cn("h-full rounded-full")}
                        style={{
                          width: `${Math.max(ratio, 1)}%`,
                          background: `var(--accent-${c.accent})`,
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

        <div className="grid gap-6">
          <section>
            <h2 className="mb-4 text-[17px] font-bold tracking-[-0.025em]">Recently Completed</h2>
            {recent.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[13.5px] text-muted">
                Mark a lesson as read to track your history here.
              </p>
            ) : (
              <ul className="grid gap-2">
                {recent.map((p) => {
                  const l = lessonById.get(p.lessonId);
                  if (!l) return null;
                  return (
                    <li key={p.id}>
                      <Link
                        href={pageHref(l.collection as CollectionKey, l.slug)}
                        className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-line-strong"
                      >
                        <CheckCircle2 className="size-4 shrink-0 text-[var(--accent-emerald)]" />
                        <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">
                          {l.title}
                        </span>
                        <span className="shrink-0 text-[11.5px] text-muted">
                          {p.completedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section id="bookmarks">
            <h2 className="mb-4 inline-flex items-center gap-2 text-[17px] font-bold tracking-[-0.025em]">
              <Bookmark className="size-4 text-[var(--accent-amber)]" />
              Saved Bookmarks
            </h2>
            {bookmarkRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[13.5px] text-muted">
                No saved bookmarks yet. Click bookmark on any lesson to save it here.
              </p>
            ) : (
              <ul className="grid gap-2">
                {bookmarkRows.map((b) => {
                  const l = lessonRows.find((x) => `${x.collection}-${x.slug}` === b.lessonSlug);
                  const href = l
                    ? pageHref(l.collection as CollectionKey, l.slug)
                    : `/docs/${b.lessonSlug.replace(/^docs-/, "")}`;
                  return (
                    <li key={b.id}>
                      <Link
                        href={href}
                        className="block rounded-xl border border-line bg-surface px-4 py-3 text-[13.5px] font-medium transition-colors hover:border-line-strong"
                      >
                        {b.lessonSlug.replace(/-/g, " ")}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
