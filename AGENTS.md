# Math Care Center — engineering guidelines

## Layout
- `content/docs/**` — four MDX collections: `(index)`, `courses`, `tactics`, `blog`, each with a `meta.json`.
- `src/mdx-components.tsx` — the MDX component registry + compiler (`protectMath`, `renderMdx`, `extractToc`).
- `src/lib/content.ts` — filesystem content source; `src/lib/source.tsx` is the public wrapper.
- `src/components/mdx/**` — interactive learning components (theorem boxes, quizzes, solvers, walkthroughs).
- `scripts/**` — content lint, pre-build, post-build and preload helpers.

## Writing MDX
- Every file needs `title` and `description` frontmatter.
- Write LaTeX normally with `$…$` and `$$…$$`; `protectMath` hoists it out of the MDX text layer,
  so braces inside LaTeX are safe.
- Inside component *attributes* (e.g. `MathQuiz question="…"`), keep `$…$` inline — `<Tex>` renders
  mixed prose and math.
- Always provide `hint` and `explanation` on checkpoints.

## Commands
- `npm run build`, `npx tsc --noEmit`, `npx drizzle-kit push`
- `npx tsx scripts/lint.ts` validates frontmatter, duplicate routes and internal links.
