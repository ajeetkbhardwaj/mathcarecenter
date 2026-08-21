import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, Clock, FileText, PlayCircle, ShieldCheck, Sparkles, Video } from "lucide-react";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, lessons } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { enrollCourseAction } from "@/lib/actions";
import { ensureSeeded } from "@/lib/seed";
import { getPage, pageHref, type CollectionKey } from "@/lib/content";
import { extractToc, renderMdx } from "@/mdx-components";
import { ReadingProgress } from "@/components/mdx/reading-progress";
import { TocList } from "@/components/toc-list";
import { YouTubePlayer } from "@/components/youtube-player";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await ensureSeeded().catch(() => undefined);

  const courseRows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  if (courseRows[0]) {
    return { title: courseRows[0].title, description: courseRows[0].tagline };
  }

  const courseLesson = getPage("courses", slug);
  if (courseLesson) {
    return { title: courseLesson.meta.title, description: courseLesson.meta.description };
  }

  return { title: "Course not found" };
}

export default async function CourseSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { slug } = await params;
  const { enrolled } = await searchParams;

  await ensureSeeded();

  // 1. Check if slug matches a course record
  const foundCourse = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  const course = foundCourse[0];

  if (course) {
    const user = await getCurrentUser();
    const lessonRows = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, course.id))
      .orderBy(asc(lessons.sortOrder));

    let isEnrolled = false;
    if (user) {
      const e = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)))
        .limit(1);
      if (e.length > 0) isEnrolled = true;
    }

    const color = `var(--accent-${course.accent})`;
    const totalMinutes = lessonRows.reduce((s, l) => s + l.minutes, 0);

    return (
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        {enrolled ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--accent-emerald)] bg-[color-mix(in_oklab,var(--accent-emerald)_8%,transparent)] px-4 py-3.5 text-[14px] font-semibold text-[var(--accent-emerald)] shadow-xs">
            <Check className="size-5 shrink-0" />
            <span>Enrolled successfully! You now have full access to every lesson in this course.</span>
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back to all courses
            </Link>

            <div className="mt-6 flex items-start gap-4">
              <span
                className="grid size-14 shrink-0 place-items-center rounded-2xl text-[26px]"
                style={{ color, background: `color-mix(in oklab, ${color} 13%, transparent)` }}
              >
                {course.emoji}
              </span>
              <div>
                <p
                  className="text-[11.5px] font-bold tracking-[0.13em] uppercase"
                  style={{ color }}
                >
                  {course.category} · {course.level}
                </p>
                <h1 className="mt-1 text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.08] font-extrabold tracking-[-0.038em]">
                  {course.title}
                </h1>
              </div>
            </div>

            <p className="mt-4 text-[16px] leading-relaxed text-muted">{course.description}</p>

            {/* Feature Highlights Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { icon: <Clock className="size-4" />, k: `${course.hours} Hours`, v: "Course Duration" },
                { icon: <Video className="size-4" />, k: `${lessonRows.length} Modules`, v: "Video Lectures" },
                { icon: <FileText className="size-4" />, k: `${totalMinutes} Min`, v: "Written Notes" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl border border-line bg-surface p-3.5">
                  <div className="flex items-center gap-2" style={{ color }}>
                    {s.icon}
                    <span className="text-[14px] font-bold text-foreground">{s.k}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-muted uppercase">{s.v}</p>
                </div>
              ))}
            </div>

            {/* Course Features Included */}
            <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-[16px] font-bold tracking-[-0.02em] text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-[var(--accent-blue)]" /> Course Highlights
              </h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 text-[13.5px]">
                {[
                  "Embedded video lectures for every module",
                  "Written mathematical documentation with LaTeX formula typesetting",
                  "Practice problem sets with complete step-by-step solutions",
                  "Lifetime access with student bookmarking and progress tracking",
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--accent-emerald)]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lesson Modules List */}
            <h2 className="mt-10 text-[19px] font-bold tracking-[-0.02em]">Curriculum Modules</h2>
            <ol className="mt-4 grid gap-2.5">
              {lessonRows.map((l, i) => {
                const href = pageHref(l.collection as CollectionKey, l.slug);

                return (
                  <li key={l.id}>
                    <Link
                      href={href}
                      className="group flex items-center gap-3.5 rounded-xl border border-line bg-surface px-4 py-3.5 transition-colors hover:border-line-strong hover:shadow-xs"
                    >
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-lg font-mono text-[12px] font-bold"
                        style={{ color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-foreground group-hover:text-[var(--accent-blue)] transition-colors">
                          {l.title}
                        </span>
                        <span className="block truncate text-[12.5px] text-muted">{l.summary}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[11.5px] text-muted">{l.minutes}m</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Enrolment Panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Course Access</p>
              <p className="mt-2 text-[28px] leading-none font-extrabold tracking-[-0.04em]">
                Free Access
              </p>

              {isEnrolled ? (
                <>
                  <p className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-emerald)] bg-[color-mix(in_oklab,var(--accent-emerald)_10%,transparent)] py-2.5 text-[13.5px] font-semibold text-[var(--accent-emerald)]">
                    <Check className="size-4" />
                    Enrolled
                  </p>
                  {lessonRows[0] ? (
                    <Link
                      href={pageHref(lessonRows[0].collection as CollectionKey, lessonRows[0].slug)}
                      className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] text-[14px] font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
                    >
                      <PlayCircle className="size-4" />
                      Start First Module
                    </Link>
                  ) : null}
                </>
              ) : (
                <form action={enrollCourseAction} className="mt-5 grid gap-3">
                  <input type="hidden" name="courseSlug" value={course.slug} />
                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] text-[14px] font-semibold text-white transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
                  >
                    {user ? "Enrol Course Free" : "Sign in to Enrol"}
                    <ArrowRight className="size-4" />
                  </button>
                  <p className="text-center text-[11.5px] text-muted">
                    1-Click enrolment for all registered students.
                  </p>
                </form>
              )}

              <ul className="mt-5 grid gap-2 border-t border-line pt-4 text-[12.5px] text-muted">
                {["Full access to video lectures", "Class PDF notes & formula sheets", "Progress tracking and bookmarking"].map(
                  (t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--accent-emerald)]" />
                      <span>{t}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // 2. Standalone course lesson view with YouTube video embed
  const lessonPost = getPage("courses", slug);
  if (lessonPost) {
    const { meta, body } = lessonPost;
    const toc = extractToc(body);
    const content = await renderMdx(body);

    const lessonRows = await db
      .select()
      .from(lessons)
      .where(eq(lessons.slug, slug))
      .limit(1);
    const youtubeId = lessonRows[0]?.youtubeId || "WUvTyaaNkzM";

    return (
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to Courses
        </Link>

        <div className="mt-6 grid gap-10 xl:grid-cols-[1fr_240px]">
          <article className="max-w-[780px]">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-emerald)] uppercase">
              Course Module
            </p>
            <h1 className="mt-2 text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.04em]">
              {meta.title}
            </h1>
            <p className="mt-3 text-[16.5px] leading-relaxed text-muted">{meta.description}</p>

            <div className="mt-6">
              <ReadingProgress
                slug={`courses-${meta.slug}`}
                minutes={meta.minutes}
                difficulty={meta.difficulty}
              />
            </div>

            {/* Embedded YouTube Video Player */}
            <YouTubePlayer videoId={youtubeId} title={meta.title} />

            <div className="prose-math mt-8">{content}</div>
          </article>

          <aside className="hidden xl:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto py-2">
              <TocList items={toc} />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  notFound();
}
