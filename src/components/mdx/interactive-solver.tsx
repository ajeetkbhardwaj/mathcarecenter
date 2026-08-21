"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Activity, FunctionSquare, Grid2x2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tex } from "./tex";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  tex,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  tex: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-background px-3.5 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-semibold text-muted">
          <Tex>{tex}</Tex>
        </span>
        <span className="font-mono text-[13px] font-bold tabular-nums text-foreground">
          {value}
        </span>
      </div>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-[var(--accent-blue)] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-blue)] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-blue)_18%,transparent)]"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-background px-3.5 py-3">
      <p className="mb-1 text-[10.5px] font-semibold tracking-[0.11em] text-muted uppercase">
        {label}
      </p>
      <p className={cn("truncate font-mono text-[13.5px] font-semibold tabular-nums", accent)}>
        {value}
      </p>
    </div>
  );
}

function fmt(n: number, d = 3) {
  if (!Number.isFinite(n)) return "—";
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? "0" : String(r);
}

/* ------------------------------------------------------------------ */

export function QuadraticSolver({
  a: a0 = 1,
  b: b0 = -3,
  c: c0 = 2,
}: {
  a?: number;
  b?: number;
  c?: number;
}) {
  const [a, setA] = useState(a0);
  const [b, setB] = useState(b0);
  const [c, setC] = useState(c0);

  const r = useMemo(() => {
    const disc = b * b - 4 * a * c;
    const degenerate = a === 0;
    const vertexX = degenerate ? Number.NaN : -b / (2 * a);
    const vertexY = degenerate ? Number.NaN : a * vertexX * vertexX + b * vertexX + c;
    let roots: string;
    if (degenerate) {
      roots = b === 0 ? (c === 0 ? "\\mathbb{R}" : "\\varnothing") : `x = ${fmt(-c / b)}`;
    } else if (disc >= 0) {
      const s = Math.sqrt(disc);
      roots = `x_1 = ${fmt((-b + s) / (2 * a))},\\; x_2 = ${fmt((-b - s) / (2 * a))}`;
    } else {
      const s = Math.sqrt(-disc);
      const re = fmt(-b / (2 * a));
      const im = fmt(Math.abs(s / (2 * a)));
      roots = `x = ${re} \\pm ${im}i`;
    }
    return { disc, vertexX, vertexY, roots, degenerate };
  }, [a, b, c]);

  return (
    <div className="not-prose my-7 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-[var(--accent-blue)] uppercase">
          <FunctionSquare className="size-3.5" />
          Quadratic Explorer
        </span>
        <button
          type="button"
          onClick={() => {
            setA(a0);
            setB(b0);
            setC(c0);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-line-strong"
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
      </div>

      <div className="space-y-4 px-4 py-5 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label="a" tex="a" value={a} min={-6} max={6} step={0.5} onChange={setA} />
          <Slider label="b" tex="b" value={b} min={-10} max={10} step={0.5} onChange={setB} />
          <Slider label="c" tex="c" value={c} min={-10} max={10} step={0.5} onChange={setC} />
        </div>

        <div className="rounded-xl border border-dashed border-line bg-surface-2 px-4 py-4 text-center">
          <Tex display>{`f(x) = ${a}x^2 ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x ${
            c >= 0 ? "+" : "-"
          } ${Math.abs(c)}`}</Tex>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat
            label="Discriminant Δ"
            value={fmt(r.disc)}
            accent={
              r.disc > 0
                ? "text-[var(--accent-emerald)]"
                : r.disc === 0
                  ? "text-[var(--accent-cyan)]"
                  : "text-[var(--accent-purple)]"
            }
          />
          <Stat label="Vertex x" value={fmt(r.vertexX)} />
          <Stat label="Vertex y" value={fmt(r.vertexY)} />
          <Stat
            label="Nature of roots"
            value={r.degenerate ? "Linear" : r.disc > 0 ? "2 real" : r.disc === 0 ? "1 double" : "2 complex"}
          />
        </div>

        <motion.div
          key={r.roots}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-line bg-background px-4 py-3.5"
        >
          <p className="mb-2 text-[10.5px] font-semibold tracking-[0.11em] text-muted uppercase">
            Roots
          </p>
          <div className="overflow-x-auto">
            <Tex>{r.roots}</Tex>
          </div>
        </motion.div>

        <p className="text-[12.5px] leading-relaxed text-muted">
          Δ = b² − 4ac = {fmt(r.disc)}. When Δ &lt; 0 the parabola never crosses the x-axis and the
          roots form a complex conjugate pair.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Matrix2x2Solver({ initial = [2, 1, 1, 2] }: { initial?: number[] }) {
  const [cells, setCells] = useState<number[]>(initial);

  const set = (i: number, v: string) => {
    const n = v === "" || v === "-" ? 0 : Number(v);
    if (Number.isNaN(n)) return;
    setCells((prev) => prev.map((x, j) => (j === i ? n : x)));
  };

  const { det, trace, eig, kind } = useMemo(() => {
    const [a, b, c, d] = cells;
    const det = a * d - b * c;
    const trace = a + d;
    const disc = trace * trace - 4 * det;
    let eig: string;
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      eig = `\\lambda_1 = ${fmt((trace + s) / 2)},\\; \\lambda_2 = ${fmt((trace - s) / 2)}`;
    } else {
      const s = Math.sqrt(-disc);
      eig = `\\lambda = ${fmt(trace / 2)} \\pm ${fmt(s / 2)}i`;
    }
    const kind =
      det === 0 ? "Singular" : disc > 0 ? "Diagonalizable (real)" : disc === 0 ? "Defective / repeated" : "Complex pair";
    return { det, trace, eig, kind };
  }, [cells]);

  return (
    <div className="not-prose my-7 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-[var(--accent-purple)] uppercase">
          <Grid2x2 className="size-3.5" />
          2×2 Matrix Analyzer
        </span>
        <button
          type="button"
          onClick={() => setCells(initial)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-line-strong"
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
      </div>

      <div className="grid gap-5 px-4 py-5 sm:grid-cols-[minmax(0,190px)_1fr] sm:px-5">
        <div>
          <p className="mb-2 text-[10.5px] font-semibold tracking-[0.11em] text-muted uppercase">
            A
          </p>
          <div className="grid grid-cols-2 gap-2">
            {cells.map((v, i) => (
              <input
                key={i}
                aria-label={`matrix entry ${i + 1}`}
                value={v}
                onChange={(e) => set(i, e.target.value)}
                inputMode="decimal"
                className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-center font-mono text-[14px] font-semibold tabular-nums outline-none transition-colors focus:border-[var(--accent-purple)]"
              />
            ))}
          </div>
          <p className="mt-2.5 text-[11.5px] text-muted">
            Edit any entry — everything updates live.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <Stat
              label="det(A) = ad − bc"
              value={fmt(det)}
              accent={det === 0 ? "text-[var(--accent-rose)]" : "text-[var(--accent-purple)]"}
            />
            <Stat label="tr(A) = a + d" value={fmt(trace)} />
          </div>
          <Stat label="Classification" value={kind} />
          <div className="rounded-xl border border-line bg-background px-4 py-3.5">
            <p className="mb-2 text-[10.5px] font-semibold tracking-[0.11em] text-muted uppercase">
              Spectrum
            </p>
            <div className="overflow-x-auto">
              <Tex>{eig}</Tex>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="λ₁ + λ₂" value={fmt(trace)} />
            <Stat label="λ₁ · λ₂" value={fmt(det)} />
          </div>
          <p className="flex items-start gap-1.5 pt-1 text-[12px] text-muted">
            <Activity className="mt-0.5 size-3.5 shrink-0" />
            Trace equals the sum of eigenvalues, determinant equals their product.
          </p>
        </div>
      </div>
    </div>
  );
}
