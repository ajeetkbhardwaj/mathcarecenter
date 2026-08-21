import { source } from "@/lib/source";
import { TAG_FILTERS } from "@/lib/constants/tags";

export const dynamic = "force-static";

export async function GET(request: Request) {
  const tag = new URL(request.url).searchParams.get("tag");
  let results = source.allPages().map((p) => ({
    title: p.title,
    description: p.description,
    href: p.href,
    collection: source.collections[p.collection]?.label ?? "General",
    tags: p.tags,
    difficulty: p.difficulty,
  }));

  if (tag) {
    const filter = TAG_FILTERS.find((t) => t.id === tag);
    if (filter) {
      results = results.filter((r) =>
        filter.keywords.some((k) =>
          `${r.title} ${r.description} ${r.tags.join(" ")}`.toLowerCase().includes(k),
        ),
      );
    }
  }

  return Response.json({ results, filters: TAG_FILTERS });
}
