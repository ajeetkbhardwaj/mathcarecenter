"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Lightbulb,
  ScrollText,
  Sigma,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TheoremKind =
  | "theorem"
  | "definition"
  | "lemma"
  | "corollary"
  | "example"
  | "formula";

const KIND: Record<
  TheoremKind,
  { label: string; icon: ReactNode; ring: string; bar: string; chip: string; glow: string }
> = {
  theorem: {
    label: "Theorem",
    icon: <ScrollText className="size-4" />,
    ring: "border-l-[var(--accent-blue)]",
    bar: "bg-[color-mix(in_oklab,var(--accent-blue)_10%,transparent)]",
    chip: "text-[var(--accent-blue)]",
    glow: "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent-blue)_16%,transparent)]",
  },
  lemma: {
    label: "Lemma",
    icon: <Sigma className="size-4" />,
    ring: "border-l-[var(--accent-blue)]",
    bar: "bg-[color-mix(in_oklab,var(--accent-blue)_8%,transparent)]",
    chip: "text-[var(--accent-blue)]",
    glow: "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent-blue)_14%,transparent)]",
  },
  definition: {
    label: "Definition",
    icon: <Lightbulb className="size-4" />,
    ring: "border-l-[var(--accent-emerald)]",
    bar: "bg-[color-mix(in_oklab,var(--accent-emerald)_10%,transparent)]",
    chip: "text-[var(--accent-emerald)]",
    glow: "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent-emerald)_16%,transparent)]",
  },
  corollary: {
    label: "Corollary",
    icon: <Sparkles className="size-4" />,
    ring: "border-l-[var(--accent-purple)]",
    bar: "bg-[color-mix(in_oklab,var(--accent-purple)_10%,transparent)]",
    chip: "text-[var(--accent-purple)]",
    glow: "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent-purple)_16%,transparent)]",
  },
  example: {
    label: "Example",
    icon: <FlaskConical className="size-4" />,
    ring: "border-l-[var(--accent-amber)]",
    bar: "bg-[color-mix(in_oklab,var(--accent-amber)_10%,transparent)]",
    chip: "text-[var(--accent-amber)]",
    glow: "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent-amber)_16%,transparent)]",
  },
  formula: {
    label: "Formula",
    icon: <Sigma className="size-4" />,
    ring: "border-l-[var(--accent-cyan)]",
    bar: "bg-[color-mix(in_oklab,var(--accent-cyan)_10%,transparent)]",
    chip: "text-[var(--accent-cyan)]",
    glow: "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent-cyan)_16%,transparent)]",
  },
};

export function TheoremBox({
  type = "theorem",
  title,
  number,
  proof,
  proofLabel,
  children,
}: {
  type?: TheoremKind;
  title?: string;
  number?: string;
  proof?: ReactNode;
  proofLabel?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const k = KIND[type] ?? KIND.theorem;
  const hasProof = proof !== undefined && proof !== null;

  return (
    <div
      className={cn(
        "not-prose my-6 rounded-r-xl border border-l-[3px] border-line py-0",
        k.ring,
        k.bar,
        k.glow,
      )}
    >
      <div className="px-4 py-4 sm:px-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-semibold tracking-[0.09em] uppercase",
              k.chip,
            )}
          >
            {k.icon}
            {k.label}
            {number ? <span className="opacity-70">· {number}</span> : null}
          </span>
          {title ? (
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              {title}
            </span>
          ) : null}
        </div>

        <div className="prose-math text-[15.5px] leading-[1.75] [&>*+*]:mt-3">{children}</div>

        {hasProof ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={id}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold transition-colors hover:border-line-strong",
                k.chip,
              )}
            >
              <ChevronDown
                className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")}
              />
              {open ? "Hide" : "Show"} {proofLabel ?? "Proof"}
            </button>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={id}
                  key="proof"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 border-t border-dashed border-line pt-3">
                    <div className="prose-math text-[15px] leading-[1.78] text-muted [&>*+*]:mt-3">
                      {proof}
                    </div>
                    <div
                      className={cn(
                        "mt-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase",
                        k.chip,
                      )}
                    >
                      <CheckCircle2 className="size-3.5" />
                      ■ Q.E.D.
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </div>
  );
}
