"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Search, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CourseCategory } from "@/lib/constants/category";
import type { Course, Lesson } from "@/db/schema";
import { pageHref } from "@/lib/urls";
import type { CollectionKey } from "@/lib/content";

export function CourseFilterView({
  courses,
  lessons,
  enrolledIds,
  categories,
}: {
  courses: Course[];
  lessons: Lesson[];
  enrolledIds: number[];
  categories: CourseCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const enrolledSet = useMemo(() => new Set(enrolledIds), [enrolledIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (selectedCategory !== "all" && c.category !== selectedCategory) return false;
      if (!q) return true;

      return (
        c.title.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    });
  }, [courses, selectedCategory, search]);

  return (
    <div>
      {/* Category Tabs & Search Bar */}
      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "cursor-pointer rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all",
                selectedCategory === cat.id
                  ? "bg-[var(--accent-blue)] text-white shadow-xs"
                  : "border border-line bg-surface text-muted hover:border-line-strong hover:text-foreground",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by keyword…"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-[13.5px] outline-none transition-colors focus:border-[var(--accent-blue)]"
          />
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <p className="text-[12.5px] text-muted">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> course{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Course Cards Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <p className="text-[15px] font-semibold text-foreground">No courses found matching your criteria</p>
          <p className="mt-1 text-[13.5px] text-muted">Try clearing the search input or choosing another category.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearch("");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-blue)] px-4 py-2 text-[13px] font-semibold text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filtered.map((c) => {
            const color = `var(--accent-${c.accent})`;
            const courseLessons = lessons.filter((l) => l.courseId === c.id);
            const isEnrolled = enrolledSet.has(c.id);

            return (
              <article
                key={c.id}
                className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-xs transition-all hover:border-line-strong hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-12 shrink-0 place-items-center rounded-xl text-[22px]"
                        style={{ color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
                      >
                        {c.emoji}
                      </span>
                      <div>
                        <span
                          className="text-[11px] font-bold tracking-[0.12em] uppercase"
                          style={{ color }}
                        >
                          {c.category} · {c.level}
                        </span>
                        <h2 className="text-[19px] font-bold tracking-[-0.02em] text-foreground">
                          {c.title}
                        </h2>
                      </div>
                    </div>

                    <span className="rounded-full border border-[var(--accent-emerald)] bg-[color-mix(in_oklab,var(--accent-emerald)_8%,transparent)] px-3 py-1 text-[11px] font-bold text-[var(--accent-emerald)] uppercase shrink-0">
                      Open Access
                    </span>
                  </div>

                  <p className="mt-4 text-[14px] leading-relaxed text-muted">{c.description}</p>

                  <div className="mt-5 grid grid-cols-2 gap-2 text-[12.5px] text-muted font-medium border-y border-line py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5 text-[var(--accent-blue)]" /> {c.hours} Hours Content
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Video className="size-3.5 text-[var(--accent-emerald)]" /> {courseLessons.length} Modules
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
                      Curriculum Outline
                    </p>
                    <ul className="grid gap-1">
                      {courseLessons.map((l) => (
                        <li key={l.id}>
                          <Link
                            href={pageHref(l.collection as CollectionKey, l.slug)}
                            className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors hover:bg-surface-2"
                          >
                            <span className="truncate font-medium">{l.title}</span>
                            <span className="shrink-0 font-mono text-[11px] text-muted">
                              {l.minutes}m
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  {isEnrolled ? (
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--accent-emerald)]">
                      <Check className="size-4" /> Enrolled
                    </span>
                  ) : (
                    <span className="text-[12.5px] text-muted font-medium">
                      Free for registered students
                    </span>
                  )}

                  <Link
                    href={`/courses/${c.slug}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
                  >
                    {isEnrolled ? "Open Course" : "View Course"}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
