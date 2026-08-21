import { sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

type SeedLesson = {
  slug: string;
  title: string;
  summary: string;
  collection: "docs" | "courses" | "blog";
  page: string;
  youtubeId: string;
  minutes: number;
};

type SeedCourse = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  level: string;
  accent: string;
  emoji: string;
  hours: number;
  sortOrder: number;
  lessons: SeedLesson[];
};

const DATA: SeedCourse[] = [
  {
    slug: "calculus",
    title: "Calculus & Analysis",
    tagline: "Limits, derivatives, integration, multivariable optimization and Stokes' theorem.",
    description:
      "Build the ε–delta foundation, master differentiation as linear approximation, and finish with vector calculus and Stokes' theorem.",
    category: "Analysis",
    level: "Intermediate",
    accent: "blue",
    emoji: "∫",
    hours: 8,
    sortOrder: 1,
    lessons: [
      {
        slug: "calculus",
        title: "Calculus: Rate of Change to Stokes' Theorem",
        summary: "ε–delta limits, optimization, and Stokes' theorem.",
        collection: "courses",
        page: "calculus",
        youtubeId: "WUvTyaaNkzM", // 3Blue1Brown Essence of Calculus
        minutes: 22,
      },
      {
        slug: "intuition-behind-calculus",
        title: "The Intuition Behind Calculus",
        summary: "Slope and accumulation as two views of one object.",
        collection: "blog",
        page: "intuition-behind-calculus",
        youtubeId: "9vKqVkMQHKk",
        minutes: 11,
      },
    ],
  },
  {
    slug: "linear-algebra",
    title: "Linear Algebra & SVD",
    tagline: "Vector spaces, linear transformations, determinants, spectral theory, and SVD.",
    description:
      "Treat matrices as linear maps. Diagonalise symmetric matrices, understand Rayleigh quotients, and derive the Singular Value Decomposition.",
    category: "Algebra",
    level: "Intermediate",
    accent: "emerald",
    emoji: "▦",
    hours: 7,
    sortOrder: 2,
    lessons: [
      {
        slug: "linear-algebra",
        title: "Vector Spaces to Singular Value Decomposition",
        summary: "Vector space axioms, linear maps, eigenvalues, and SVD.",
        collection: "courses",
        page: "linear-algebra",
        youtubeId: "fNk_zzaMoSs", // 3Blue1Brown Essence of Linear Algebra
        minutes: 24,
      },
    ],
  },
  {
    slug: "modern-algebra",
    title: "Modern Algebra",
    tagline: "Groups, Lagrange's theorem, quotient structures, and field extensions.",
    description:
      "The structural side of mathematics. Learn cosets, normal subgroups, ring homomorphisms, and the First Isomorphism Theorem.",
    category: "Structure",
    level: "Advanced",
    accent: "purple",
    emoji: "◈",
    hours: 10,
    sortOrder: 3,
    lessons: [
      {
        slug: "algebra",
        title: "Groups, Subgroups, and Field Extensions",
        summary: "Cosets, Lagrange's theorem, normality, and ring homomorphisms.",
        collection: "courses",
        page: "algebra",
        youtubeId: "mH0oCDa74tE", // Abstract Algebra introduction
        minutes: 26,
      },
    ],
  },
  {
    slug: "probability",
    title: "Probability & Stochastic Models",
    tagline: "Kolmogorov axioms, Bayes' theorem, CLT, and Markov chains.",
    description:
      "From probability foundations to limit theorems and Markov chains used in statistics and machine learning.",
    category: "Chance",
    level: "Advanced",
    accent: "amber",
    emoji: "🎲",
    hours: 9,
    sortOrder: 4,
    lessons: [
      {
        slug: "probability",
        title: "Kolmogorov Axioms to Central Limit Theorem",
        summary: "Bayes' rule, continuous densities, CLT, and Markov chains.",
        collection: "courses",
        page: "probability",
        youtubeId: "HZGCoVF3YvM", // Probability theory lecture
        minutes: 25,
      },
    ],
  },
];

let inflight: Promise<void> | null = null;

async function run() {
  // Seed demo users if not present
  try {
    const passwordHash = await hashPassword("mathematics");
    const demoUsers = [
      { name: "Ada Lovelace", email: "ada@mathcare.dev", passwordHash },
      { name: "Alan Turing", email: "alan@mathcare.dev", passwordHash },
      { name: "Student Explorer", email: "student@mathcare.dev", passwordHash },
    ];
    for (const u of demoUsers) {
      await db
        .insert(users)
        .values({ name: u.name, email: u.email, passwordHash: u.passwordHash, role: "student", plan: "free" })
        .onConflictDoNothing();
    }
  } catch {
    // Ignore if table doesn't support or already seeded
  }

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(courses);
  if (count > 0) return;

  for (const c of DATA) {
    const inserted = await db
      .insert(courses)
      .values({
        slug: c.slug,
        title: c.title,
        tagline: c.tagline,
        description: c.description,
        category: c.category,
        level: c.level,
        accent: c.accent,
        emoji: c.emoji,
        hours: c.hours,
        sortOrder: c.sortOrder,
      })
      .onConflictDoNothing()
      .returning({ id: courses.id });

    const courseId = inserted[0]?.id;
    if (!courseId) continue;

    await db
      .insert(lessons)
      .values(
        c.lessons.map((l, i) => ({
          courseId,
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          collection: l.collection,
          mdxPath:
            l.collection === "docs"
              ? `content/docs/${l.page}.mdx`
              : `content/${l.collection}/${l.page}.mdx`,
          youtubeId: l.youtubeId,
          youtubeUrl: `https://www.youtube.com/watch?v=${l.youtubeId}`,
          minutes: l.minutes,
          sortOrder: i,
        })),
      )
      .onConflictDoNothing();
  }
}

/** Idempotent, concurrency-safe bootstrap of curriculum rows. */
export async function ensureSeeded() {
  if (!inflight) {
    inflight = run().catch((err) => {
      inflight = null;
      throw err;
    });
  }
  return inflight;
}
