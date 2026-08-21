export type TagFilter = {
  id: string;
  label: string;
  keywords: string[];
};

export const TAG_FILTERS: TagFilter[] = [
  { id: "calculus", label: "Calculus", keywords: ["calculus", "limits", "analysis", "integration"] },
  { id: "linear-algebra", label: "Linear algebra", keywords: ["linear algebra", "matrices", "eigenvalues", "svd"] },
  { id: "algebra", label: "Algebra", keywords: ["abstract algebra", "groups", "rings", "fields"] },
  { id: "probability", label: "Probability", keywords: ["probability", "bayes", "clt", "markov"] },
  { id: "ai", label: "AI mathematics", keywords: ["ai", "tensors", "attention", "optimisation"] },
];

export function tagsFor(...values: string[]): string[] {
  const haystack = values.join(" ").toLowerCase();
  return TAG_FILTERS.filter((t) => t.keywords.some((k) => haystack.includes(k))).map((t) => t.id);
}
