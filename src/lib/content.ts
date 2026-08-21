import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { pageHref } from "./urls";

export { pageHref };

export type CollectionKey = "docs" | "courses" | "blog";

export type PageMeta = {
  collection: CollectionKey;
  slug: string; // "index" for collection root
  href: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Olympiad";
  tags: string[];
  order: number;
  minutes: number;
  featured: boolean;
  emoji: string;
  section: string;
};

export type PageRecord = {
  meta: PageMeta;
  body: string;
};

type CollectionConfig = {
  key: CollectionKey;
  label: string;
  navLabel: string;
  blurb: string;
  dir: string;
  base: string;
  accent: "blue" | "emerald" | "purple" | "amber";
  emoji: string;
};

export const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
  docs: {
    key: "docs",
    label: "Start Guide & Roadmap",
    navLabel: "Start Guide",
    blurb: "Orientation, learning graph, and the master formula sheet.",
    dir: "(index)",
    base: "/docs",
    accent: "blue",
    emoji: "✦",
  },
  courses: {
    key: "courses",
    label: "Core Curriculum",
    navLabel: "Courses",
    blurb: "Calculus, Linear Algebra, Modern Algebra and Probability.",
    dir: "courses",
    base: "/courses",
    accent: "emerald",
    emoji: "∑",
  },
  blog: {
    key: "blog",
    label: "Blog & Deep Dives",
    navLabel: "Blog & Articles",
    blurb: "Essays on mathematical intuition, AI, and research practice.",
    dir: "blog",
    base: "/blog",
    accent: "amber",
    emoji: "✎",
  },
};

export const COLLECTION_ORDER: CollectionKey[] = ["docs", "courses", "blog"];

const CONTENT_ROOT = path.join(process.cwd(), "content");

const DIFFICULTIES: PageMeta["difficulty"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Olympiad",
];

function coerceDifficulty(value: unknown): PageMeta["difficulty"] {
  return DIFFICULTIES.includes(value as PageMeta["difficulty"])
    ? (value as PageMeta["difficulty"])
    : "Intermediate";
}

function readDirSafe(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

function toMeta(collection: CollectionKey, file: string, raw: string): PageMeta {
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;
  const slug = file.replace(/\.mdx$/, "");
  const href = pageHref(collection, slug);
  const title =
    (typeof data.title === "string" && data.title.trim()) ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const words = parsed.content.split(/\s+/).length;

  return {
    collection,
    slug,
    href,
    title,
    description:
      (typeof data.description === "string" && data.description.trim()) ||
      "No description provided.",
    difficulty: coerceDifficulty(data.difficulty),
    tags: Array.isArray(data.tags) ? (data.tags as string[]).map(String) : [],
    order: typeof data.order === "number" ? data.order : slug === "index" ? 0 : 99,
    minutes: typeof data.minutes === "number" ? data.minutes : Math.max(2, Math.round(words / 190)),
    featured: data.featured === true,
    emoji: typeof data.emoji === "string" ? data.emoji : "◆",
    section: typeof data.section === "string" ? data.section : "Pages",
  };
}

const cache = new Map<CollectionKey, PageMeta[]>();

export function getPages(collection: CollectionKey): PageMeta[] {
  const cached = cache.get(collection);
  if (cached) return cached;

  const dir = path.join(CONTENT_ROOT, COLLECTIONS[collection].dir === "(index)" ? "docs" : COLLECTIONS[collection].dir);
  const pages = readDirSafe(dir)
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      return toMeta(collection, file, raw);
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  cache.set(collection, pages);
  return pages;
}

export function getAllPages(): PageMeta[] {
  return COLLECTION_ORDER.flatMap((key) => getPages(key));
}

export function getPage(collection: CollectionKey, slug: string): PageRecord | null {
  const folder = COLLECTIONS[collection].dir === "(index)" ? "docs" : COLLECTIONS[collection].dir;
  const dir = path.join(CONTENT_ROOT, folder);
  const file = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  return { meta: toMeta(collection, `${slug}.mdx`, raw), body: matter(raw).content };
}

export function getSearchIndex() {
  return getAllPages().map((p) => ({
    title: p.title,
    description: p.description,
    href: p.href,
    collection: COLLECTIONS[p.collection].label,
    tags: p.tags,
    difficulty: p.difficulty,
  }));
}

export function siblingsOf(collection: CollectionKey, slug: string) {
  const pages = getPages(collection);
  const i = pages.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? pages[i - 1] : null,
    next: i >= 0 && i < pages.length - 1 ? pages[i + 1] : null,
  };
}
