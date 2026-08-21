"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, HelpCircle, RotateCcw, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tex } from "./tex";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function MathQuiz({
  quizId,
  question,
  options,
  answerIndex,
  hint,
  explanation,
  points = 10,
}: {
  quizId: string;
  question: string;
  options: string[];
  answerIndex: number;
  hint?: string;
  explanation: string;
  points?: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const answered = selected !== null;
  const correct = selected === answerIndex;

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    setAttempts((a) => a + 1);
    if (i === answerIndex) {
      // fire-and-forget score sync (anonymous-safe)
      void fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, correct: true, points }),
      }).catch(() => undefined);
    }
  }

  function reset() {
    setSelected(null);
    setShowHint(false);
  }

  return (
    <div className="not-prose my-7 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-[var(--accent-amber)] uppercase">
          <Trophy className="size-3.5" />
          Checkpoint
        </span>
        <span className="text-[11px] font-medium text-muted">
          {answered && correct ? `+${points} pts` : `${points} pts`}
        </span>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="mb-5 text-[15.5px] leading-relaxed font-medium">
          <Tex>{question}</Tex>
        </div>

        <div className="grid gap-2.5">
          {options.map((opt, i) => {
            const isChosen = selected === i;
            const isAnswer = i === answerIndex;
            const state = !answered
              ? "idle"
              : isAnswer
                ? "correct"
                : isChosen
                  ? "wrong"
                  : "muted";

            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                  state === "idle" &&
                    "cursor-pointer border-line bg-background hover:border-[var(--accent-blue)] hover:bg-surface-2",
                  state === "correct" &&
                    "border-[var(--accent-emerald)] bg-[color-mix(in_oklab,var(--accent-emerald)_9%,transparent)]",
                  state === "wrong" &&
                    "border-[var(--accent-rose)] bg-[color-mix(in_oklab,var(--accent-rose)_9%,transparent)]",
                  state === "muted" && "border-line bg-background opacity-55",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-lg border text-[11px] font-bold transition-colors",
                    state === "idle" && "border-line-strong text-muted",
                    state === "correct" &&
                      "border-[var(--accent-emerald)] bg-[var(--accent-emerald)] text-white",
                    state === "wrong" &&
                      "border-[var(--accent-rose)] bg-[var(--accent-rose)] text-white",
                    state === "muted" && "border-line text-muted",
                  )}
                >
                  {state === "correct" ? (
                    <Check className="size-4" />
                  ) : state === "wrong" ? (
                    <X className="size-4" />
                  ) : (
                    LETTERS[i]
                  )}
                </span>
                <span className="min-w-0 flex-1 text-[14.5px] leading-relaxed">
                  <Tex>{opt}</Tex>
                </span>
              </button>
            );
          })}
        </div>

        {hint ? (
          <div className="mt-3.5">
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-[var(--accent-purple)]"
            >
              <HelpCircle className="size-3.5" />
              {showHint ? "Hide hint" : "Need a hint?"}
            </button>
            <AnimatePresence initial={false}>
              {showHint ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-2.5 rounded-xl border border-dashed border-line bg-surface-2 px-3.5 py-3 text-[14px] leading-relaxed text-muted">
                    <Tex>{hint}</Tex>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {answered ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "mt-4 rounded-xl border-l-[3px] px-4 py-3.5",
                  correct
                    ? "border-l-[var(--accent-emerald)] bg-[color-mix(in_oklab,var(--accent-emerald)_8%,transparent)]"
                    : "border-l-[var(--accent-rose)] bg-[color-mix(in_oklab,var(--accent-rose)_8%,transparent)]",
                )}
              >
                <p
                  className={cn(
                    "mb-1.5 text-[12px] font-bold tracking-[0.1em] uppercase",
                    correct ? "text-[var(--accent-emerald)]" : "text-[var(--accent-rose)]",
                  )}
                >
                  {correct ? "Correct" : "Not quite"}
                </p>
                <div className="prose-math text-[14.5px] leading-relaxed [&>*+*]:mt-2">
                  <p>
                    <Tex>{explanation}</Tex>
                  </p>
                </div>
                {!correct ? (
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold transition-colors hover:border-line-strong"
                  >
                    <RotateCcw className="size-3.5" />
                    Try again
                  </button>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {attempts > 1 && correct ? (
          <p className="mt-2.5 text-[11.5px] text-muted">Solved in {attempts} attempts.</p>
        ) : null}
      </div>
    </div>
  );
}
