import Link from "next/link";

export type NavItem = { href: string; label: string; match: string[] };

export const NAV_ITEMS: NavItem[] = [
  { href: "/docs", label: "Start Here", match: ["/docs"] },
  { href: "/courses", label: "Courses", match: ["/courses"] },
  { href: "/docs/blog", label: "Blog & Articles", match: ["/docs/blog"] },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-blue)] font-serif text-[17px] leading-none font-bold text-white shadow-[0_2px_10px_color-mix(in_oklab,var(--accent-blue)_40%,transparent)]">
        π
      </span>
      {!compact ? (
        <span className="text-[15.5px] font-bold tracking-[-0.02em] whitespace-nowrap">
          Math Care Center
        </span>
      ) : (
        <span className="text-[15.5px] font-bold tracking-[-0.02em] lg:hidden">MCC</span>
      )}
    </Link>
  );
}

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
