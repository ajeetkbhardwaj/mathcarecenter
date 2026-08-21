import type { CollectionKey } from "@/lib/content";

export type CourseCategory = {
  id: string;
  name: string;
  badge: string;
  description: string;
};

/** Course categories inspired by MathsCare curriculum */
export const COURSE_CATEGORIES: CourseCategory[] = [
  { id: "all", name: "All Courses", badge: "ALL", description: "Explore complete curriculum" },
  { id: "Analysis", name: "Calculus & Analysis", badge: "CALCULUS", description: "Limits, derivatives, integration & vector calculus" },
  { id: "Algebra", name: "Linear & Abstract Algebra", badge: "ALGEBRA", description: "Matrices, spectral theory, groups & fields" },
  { id: "Structure", name: "Higher Mathematics", badge: "ADVANCED", description: "CSIR NET, IIT JAM & GATE core tracks" },
  { id: "Chance", name: "Probability & Stochastic", badge: "PROBABILITY", description: "Bayes, CLT, distributions & Markov chains" },
];

export const CATEGORY_LABELS: Record<CollectionKey, string> = {
  docs: "Start Guide & Roadmap",
  courses: "Core Curriculum",
  blog: "Blog & Articles",
};

export const SITE = {
  name: "Math Care Center",
  tagline: "The Premier Platform for Higher Mathematics",
  description:
    "Affordable and comprehensive mathematics courses, start guides, formula cheat sheets, and deep dive essays.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.mathscare.com",
  locale: "en_US",
} as const;
