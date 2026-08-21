import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Check, Clock, Sparkles } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, lessons, type Course, type Lesson } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { formatPrice } from "@/lib/utils";
import { COURSE_CATEGORIES } from "@/lib/constants/category";
import { CourseFilterView } from "./course-filter-view";

export const metadata: Metadata = {
  title: "Courses Directory — MathsCare Platform",
  description: "Browse affordable, comprehensive higher mathematics courses for CSIR NET, IIT JAM, GATE and University Mathematics.",
};

export const dynamic = "force-dynamic";

async function load() {
  try {
    await ensureSeeded();
    const [user, rows, lessonRows] = await Promise.all([
      getCurrentUser(),
      db.select().from(courses).where(eq(courses.published, true)).orderBy(asc(courses.sortOrder)) as Promise<Course[]>,
      db.select().from(lessons) as Promise<Lesson[]>,
    ]);

    const enrolledCourseIds = new Set<number>();
    if (user) {
      const e = (await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .where(eq(enrollments.userId, user.id))) as Array<{ courseId: number }>;
      e.forEach((r) => enrolledCourseIds.add(r.courseId));
    }

    return { rows, lessonRows, enrolledCourseIds, user };
  } catch {
    return { rows: [] as Course[], lessonRows: [] as Lesson[], enrolledCourseIds: new Set<number>(), user: null };
  }
}

export default async function CoursesDirectoryPage() {
  const { rows, lessonRows, enrolledCourseIds } = await load();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      {/* Header Banner */}
      <div className="mb-10 rounded-2xl border border-line bg-surface p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-3 py-1 text-[12px] font-semibold text-[var(--accent-blue)]">
              <Sparkles className="size-3.5 text-[var(--accent-amber)]" />
              Maths Care Online Learning Platform
            </span>
            <h1 className="mt-3 text-[clamp(2rem,4.5vw,2.8rem)] leading-[1.08] font-extrabold tracking-[-0.038em]">
              Explore Mathematics Courses
            </h1>
            <p className="mt-2.5 max-w-2xl text-[15.5px] leading-relaxed text-muted">
              Structured courses for CSIR NET, IIT JAM, GATE, CUET-PG and Higher Mathematics. Choose a batch to start learning immediately.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-background px-4 text-[13.5px] font-semibold transition-colors hover:border-line-strong"
            >
              <BookOpen className="size-4 text-muted" />
              Start Guide & Formulas
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Category & Search Filter */}
      <CourseFilterView
        courses={rows}
        lessons={lessonRows}
        enrolledIds={Array.from(enrolledCourseIds)}
        categories={COURSE_CATEGORIES}
      />
    </div>
  );
}
