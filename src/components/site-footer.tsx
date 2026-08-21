import Link from "next/link";

const COLUMNS = [
  {
    title: "Start Guide",
    links: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/learning-path", label: "Learning path" },
      { href: "/docs/formula-cheat-sheet", label: "Formula cheat sheet" },
      { href: "/courses", label: "Courses directory" },
    ],
  },
  {
    title: "Courses",
    links: [
      { href: "/courses/calculus", label: "Calculus" },
      { href: "/courses/linear-algebra", label: "Linear algebra" },
      { href: "/courses/modern-algebra", label: "Modern algebra" },
      { href: "/courses/probability", label: "Probability" },
    ],
  },
  {
    title: "Blog & Account",
    links: [
      { href: "/blog", label: "Blog essays" },
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
      { href: "/dashboard", label: "Student dashboard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-background-subtle">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent-blue)] font-serif text-[17px] font-bold text-white shadow-xs">
              π
            </span>
            <span className="text-[15.5px] font-bold tracking-[-0.02em]">Math Care Center</span>
          </div>
          <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-muted">
            An intuitive mathematics academy bridging geometric intuition, algebraic rigour, and computation.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-[11px] font-bold tracking-[0.13em] text-foreground uppercase">
              {col.title}
            </p>
            <ul className="grid gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13.5px] text-muted transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <p className="text-[12.5px] text-muted">
            © {new Date().getFullYear()} Math Care Center. Modern mathematics education.
          </p>
          <p className="font-mono text-[12px] text-muted">∫ f′(x) dx = f(x) + C</p>
        </div>
      </div>
    </footer>
  );
}
