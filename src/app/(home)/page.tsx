import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code,
  FileText,
  Sparkles,
  Video,
} from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    num: "01",
    title: "Video Lectures",
    description: "Embedded YouTube video lectures for every module.",
    icon: <Video className="size-5 text-[var(--accent-blue)]" />,
  },
  {
    num: "02",
    title: "Written Notes & Formulas",
    description: "Structured LaTeX mathematical documentation and formula cheat sheets.",
    icon: <FileText className="size-5 text-[var(--accent-emerald)]" />,
  },
  {
    num: "03",
    title: "Problem Sets & Walkthroughs",
    description: "Step-by-step problem walkthroughs with complete solutions.",
    icon: <CheckCircle2 className="size-5 text-[var(--accent-amber)]" />,
  },
];

const PATHWAYS = [
  {
    stage: "Stage 1",
    title: "Calculus & Analysis",
    description: "Rate of change, ε–δ limits, integration, and Stokes' theorem.",
    color: "var(--accent-blue)",
    href: "/courses/calculus",
  },
  {
    stage: "Stage 2",
    title: "Linear Algebra & SVD",
    description: "Vector spaces, linear maps, eigenvalues, and SVD.",
    color: "var(--accent-emerald)",
    href: "/courses/linear-algebra",
  },
  {
    stage: "Stage 3",
    title: "Modern Algebra",
    description: "Groups, cosets, Lagrange's theorem, and quotient rings.",
    color: "var(--accent-purple)",
    href: "/courses/modern-algebra",
  },
  {
    stage: "Stage 4",
    title: "Probability Models",
    description: "Axioms, Bayes' theorem, CLT, and Markov chains.",
    color: "var(--accent-amber)",
    href: "/courses/probability",
  },
];

async function loadData() {
  try {
    await ensureSeeded();
    const [allCourses, allLessons] = await Promise.all([
      db.select().from(courses).where(eq(courses.published, true)).orderBy(asc(courses.sortOrder)).limit(3),
      db.select().from(lessons),
    ]);
    return { allCourses, allLessons };
  } catch {
    return { allCourses: [], allLessons: [] };
  }
}

export default async function HomePage() {
  const { allCourses, allLessons } = await loadData();

  return (
    <div className="overflow-x-hidden">
      {/* Clean Hero Section */}
      <section className="relative border-b border-line bg-background pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid-bg absolute inset-0 opacity-50 pointer-events-none" />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-[12px] font-bold tracking-wide uppercase text-[var(--accent-blue)] shadow-xs">
              <Sparkles className="size-3.5 text-[var(--accent-amber)]" />
              Math Care Center
            </span>

            <h1 className="mt-5 text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] font-extrabold tracking-[-0.04em]">
              Mathematics Education <br />
              <span className="text-[var(--accent-blue)]">Built for Clarity & Mastery</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted">
              Explore structured mathematics courses, start guides, formula cheat sheets, and video lectures. Free enrolment for all registered students.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/courses"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--accent-blue)] px-7 text-[14.5px] font-semibold text-white transition-all hover:opacity-90 shadow-md hover:scale-[1.02]"
              >
                Browse All Courses
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-surface px-7 text-[14.5px] font-semibold text-foreground transition-all hover:border-line-strong hover:bg-surface-2"
              >
                <BookOpen className="size-4 text-muted" />
                Start Guide & Formula Sheet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Learning System */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-blue)] uppercase">
            Learning Experience
          </p>
          <h2 className="mt-2 text-[clamp(1.8rem,3.6vw,2.5rem)] font-bold tracking-[-0.035em]">
            A Structured Platform for Mathematics
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-line bg-surface p-6 shadow-xs"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl border border-line bg-background">
                  {f.icon}
                </span>
                <span className="font-mono text-[13px] font-extrabold text-muted">{f.num}</span>
              </div>
              <h3 className="text-[17px] font-bold tracking-[-0.02em]">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Demo Preview */}
      <section className="border-t border-line bg-background-subtle py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 max-w-5xl mx-auto">
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-blue)] uppercase">
                Course Preview
              </p>
              <h2 className="mt-1.5 text-[clamp(1.6rem,3.2vw,2.2rem)] font-bold tracking-[-0.03em]">
                Featured Mathematics Courses
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-blue)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
            >
              View All Courses
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            {allCourses.map((c) => {
              const color = `var(--accent-${c.accent})`;
              const courseLessons = allLessons.filter((l) => l.courseId === c.id);

              return (
                <article
                  key={c.id}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-xs transition-all hover:border-line-strong hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="grid size-10 place-items-center rounded-xl text-[20px]"
                        style={{ color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
                      >
                        {c.emoji}
                      </span>
                      <div>
                        <span className="text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color }}>
                          {c.category}
                        </span>
                        <h3 className="text-[17px] font-bold tracking-[-0.02em]">{c.title}</h3>
                      </div>
                    </div>

                    <p className="text-[13.5px] leading-relaxed text-muted line-clamp-3">{c.tagline}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[12.5px]">
                    <span className="text-muted font-medium">{courseLessons.length} Modules</span>
                    <Link
                      href={`/courses/${c.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-[var(--accent-blue)] hover:underline"
                    >
                      View Course <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* View All CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 text-[14px] font-semibold text-foreground transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              Explore Complete Course Directory
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Curriculum Sequences */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--accent-emerald)] uppercase">
            Pathways
          </p>
          <h2 className="mt-2 text-[clamp(1.8rem,3.6vw,2.5rem)] font-bold tracking-[-0.035em]">
            Recommended Sequence
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PATHWAYS.map((p, idx) => (
            <Link
              key={p.title}
              href={p.href}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-xs transition-all hover:border-line-strong hover:-translate-y-0.5"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="font-mono text-[11px] font-extrabold tracking-wider uppercase"
                    style={{ color: p.color }}
                  >
                    {p.stage}
                  </span>
                </div>
                <h3 className="text-[18px] font-bold tracking-[-0.02em] group-hover:text-[var(--accent-blue)] transition-colors">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{p.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-line flex items-center justify-between text-[12.5px] font-semibold text-[var(--accent-blue)]">
                <span>Go to Course</span>
                <ArrowRight className="size-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-10 text-center shadow-md sm:p-14">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-[clamp(1.8rem,3.8vw,2.5rem)] font-extrabold tracking-[-0.035em]">
              Start Your Student Account
            </h2>
            <p className="mt-3 text-[15.5px] text-muted">
              Sign up free to enrol in courses, save bookmarks, and track your progress.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--accent-blue)] px-7 text-[14.5px] font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
              >
                Create Free Account
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex h-12 items-center rounded-xl border border-line bg-background px-7 text-[14.5px] font-semibold text-foreground transition-colors hover:border-line-strong"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
