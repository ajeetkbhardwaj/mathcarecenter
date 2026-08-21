"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Lightbulb, ListOrdered, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = {
  title: string;
  body: ReactNode;
  hint?: string;
};

export function StepByStep({
  title = "Guided solution",
  steps,
}: {
  title?: string;
  steps: Step[];
}) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [openHint, setOpenHint] = useState(false);

  const total = steps.length;
  const step = steps[Math.min(index, total - 1)];
  const isLast = index === total - 1;

  function markDone() {
    setDone((prev) => (prev.includes(index) ? prev : [...prev, index]));
    if (!isLast) {
      setIndex((i) => i + 1);
      setOpenHint(false);
    } else {
      setIndex(total);
    }
  }

  const finished = index >= total;

  return (
    <div className="not-prose my-7 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-[var(--accent-cyan)] uppercase">
          <ListOrdered className="size-3.5" />
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              title={`Step ${i + 1}`}
              className={cn(
                "size-2 rounded-full transition-colors",
                done.includes(i)
                  ? "bg-[var(--accent-emerald)]"
                  : i === index
                    ? "bg-[var(--accent-cyan)]"
                    : "bg-line-strong",
              )}
            />
          ))}
        </div>
      </div>

      {finished ? (
        <div className="px-5 py-8 text-center">
          <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full border border-[var(--accent-emerald)] bg-[color-mix(in_oklab,var(--accent-emerald)_12%,transparent)] text-[var(--accent-emerald)]">
            <Check className="size-5" />
          </div>
          <p className="text-[15px] font-semibold">Walkthrough complete</p>
          <p className="mx-auto mt-1 max-w-sm text-[13.5px] text-muted">
            {done.length} of {total} steps reviewed. Repeat it until the structure feels automatic.
          </p>
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setDone([]);
              setOpenHint(false);
            }}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-background px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-line-strong"
          >
            <RotateCcw className="size-3.5" />
            Restart walkthrough
          </button>
        </div>
      ) : (
        <div className="px-4 py-5 sm:px-5">
          <div key={index} className="animate-rise">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg border border-line bg-background font-mono text-[12px] font-bold text-[var(--accent-cyan)]">
                {index + 1}
              </span>
              <span className="text-[14.5px] font-semibold tracking-[-0.01em]">{step.title}</span>
              {done.includes(index) ? (
                <Check className="size-4 text-[var(--accent-emerald)]" />
              ) : null}
            </div>

            <div className="prose-math text-[15px] leading-[1.75] [&>*+*]:mt-3">{step.body}</div>

            {step.hint ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setOpenHint((v) => !v)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-[var(--accent-purple)]"
                >
                  <Lightbulb className="size-3.5" />
                  {openHint ? "Hide hint" : "Why this step?"}
                </button>
                <AnimatePresence initial={false}>
                  {openHint ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2.5 rounded-xl border border-dashed border-line bg-surface-2 px-3.5 py-3 text-[13.5px] leading-relaxed text-muted">
                        {step.hint}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                setOpenHint(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-3 py-1.5 text-xs font-semibold transition-colors hover:border-line-strong disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="size-3.5" />
              Previous
            </button>

            <span className="font-mono text-[11.5px] text-muted">
              {index + 1} / {total}
            </span>

            <button
              type="button"
              onClick={markDone}
              className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-[var(--accent-blue)] px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              {isLast ? "Finish" : "Mark & next"}
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
