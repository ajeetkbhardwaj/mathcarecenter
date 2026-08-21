"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Node = { label: string; accent: string; tag?: string };
type Stage = { id: string; title: string; blurb: string; nodes: Node[] };

const ACCENTS: Record<string, string> = {
  blue: "var(--accent-blue)",
  emerald: "var(--accent-emerald)",
  purple: "var(--accent-purple)",
  amber: "var(--accent-amber)",
  cyan: "var(--accent-cyan)",
};

const STAGES: Stage[] = [
  {
    id: "s1",
    title: "Stage 1 · Foundations",
    blurb: "Single-variable calculus: limits, derivatives, integrals and the fundamental theorem.",
    nodes: [
      { label: "Limits & Continuity", accent: "blue", tag: "ε–δ" },
      { label: "Differentiation", accent: "blue", tag: "f′(x)" },
      { label: "Integration", accent: "cyan", tag: "∫ f dx" },
    ],
  },
  {
    id: "s2",
    title: "Stage 2 · Structure",
    blurb: "Linear algebra gives you coordinates for every later idea, including optimisation.",
    nodes: [
      { label: "Vector Spaces", accent: "emerald", tag: "V, W" },
      { label: "Matrices & Maps", accent: "emerald", tag: "Ax = b" },
      { label: "Eigen-decomposition", accent: "purple", tag: "A = QΛQᵀ" },
    ],
  },
  {
    id: "s3",
    title: "Stage 3 · Optimisation",
    blurb: "Multivariable calculus plus spectral theory: gradients, Hessians, convexity, SVD.",
    nodes: [
      { label: "Gradient & Hessian", accent: "purple", tag: "∇f, ∇²f" },
      { label: "Convexity", accent: "cyan", tag: "KKT" },
      { label: "SVD & PCA", accent: "emerald", tag: "A = UΣVᵀ" },
    ],
  },
  {
    id: "s4",
    title: "Stage 4 · Dynamics & Chance",
    blurb: "Where change and uncertainty meet: ODEs, vector calculus and stochastic models.",
    nodes: [
      { label: "Differential Equations", accent: "amber", tag: "ẋ = Ax" },
      { label: "Vector Calculus", accent: "cyan", tag: "Stokes" },
      { label: "Probability & Limits", accent: "amber", tag: "CLT" },
    ],
  },
];

export function RoadmapGraph({ compact = false }: { compact?: boolean }) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-line bg-surface p-1">
      <div className="grid-bg rounded-xl px-3 py-5 sm:px-5">
        {STAGES.map((stage, i) => (
          <div key={stage.id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h4 className="text-[13px] font-bold tracking-[0.09em] uppercase text-foreground">
                  {stage.title}
                </h4>
                {!compact ? (
                  <p className="text-[12.5px] text-muted">{stage.blurb}</p>
                ) : null}
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3">
                {stage.nodes.map((n) => {
                  const color = ACCENTS[n.accent] ?? ACCENTS.blue;
                  return (
                    <div
                      key={n.label}
                      className="group relative rounded-xl border border-line bg-background px-3.5 py-3 transition-transform duration-200 hover:-translate-y-0.5"
                      style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 14%, transparent)` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13.5px] font-semibold text-foreground">{n.label}</p>
                        {n.tag ? (
                          <span
                            className="rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold"
                            style={{
                              color,
                              background: `color-mix(in oklab, ${color} 12%, transparent)`,
                            }}
                          >
                            {n.tag}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className={cn("mt-2 h-[2px] w-8 rounded-full")}
                        style={{ background: color }}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {i < STAGES.length - 1 ? (
              <div className="my-3 flex items-center justify-center gap-2 pl-4">
                <div className="h-6 w-px bg-line-strong" />
                <ArrowDown className="size-3.5 text-muted" />
                <div className="h-6 w-px bg-line-strong" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
