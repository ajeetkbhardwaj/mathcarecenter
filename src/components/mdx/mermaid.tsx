"use client";

import { useMemo } from "react";
import { Network } from "lucide-react";

type ParsedNode = { id: string; label: string };
type Parsed = { nodes: Map<string, string>; layers: string[][]; edges: [string, string][] };

const SKIP = /^\s*(graph|flowchart|subgraph|end|%%|style|classDef|class|linkStyle|click)/;

/** Minimal, dependency-free renderer for mermaid `graph TD|LR` flowcharts. */
function parseChart(chart: string): Parsed {
  const nodes = new Map<string, string>();
  const edges: [string, string][] = [];

  for (const raw of chart.split("\n")) {
    const line = raw.trim();
    if (!line || SKIP.test(line)) continue;

    const defRe = /([A-Za-z_][\w-]*)\s*[\[({]([^\])}]*)[\])}]/g;
    let m: RegExpExecArray | null;
    while ((m = defRe.exec(line))) nodes.set(m[1], m[2].trim() || m[1]);

    const edgeRe = /([A-Za-z_][\w-]*)\s*(?:-\.->|==>|-->|---)\s*(?:\|[^|]*\|\s*)?([A-Za-z_][\w-]*)/g;
    while ((m = edgeRe.exec(line))) {
      edges.push([m[1], m[2]]);
      if (!nodes.has(m[1])) nodes.set(m[1], m[1]);
      if (!nodes.has(m[2])) nodes.set(m[2], m[2]);
    }
  }

  const incoming = new Set(edges.map(([, to]) => to));
  const depth = new Map<string, number>();
  for (const id of nodes.keys()) if (!incoming.has(id)) depth.set(id, 0);

  // longest-path layering with a bounded number of relaxation passes
  for (let pass = 0; pass < nodes.size + 1; pass += 1) {
    let changed = false;
    for (const [from, to] of edges) {
      const next = (depth.get(from) ?? 0) + 1;
      if (next > (depth.get(to) ?? -1)) {
        depth.set(to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const maxDepth = Math.max(0, ...[...depth.values()]);
  const layers: string[][] = Array.from({ length: maxDepth + 1 }, () => []);
  for (const id of nodes.keys()) layers[depth.get(id) ?? 0].push(id);

  return { nodes, layers, edges };
}

export function Mermaid({ chart, caption }: { chart: string; caption?: string }) {
  const { nodes, layers, edges } = useMemo<Parsed>(() => parseChart(chart), [chart]);

  return (
    <figure className="not-prose my-7 overflow-hidden rounded-2xl border border-line bg-surface">
      <figcaption className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-[var(--accent-cyan)] uppercase">
        <Network className="size-3.5" />
        {caption ?? "Dependency diagram"}
      </figcaption>
      <div className="grid-bg overflow-x-auto px-4 py-5">
        <div className="flex min-w-max items-stretch gap-2">
          {layers.map((layer, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col justify-center gap-2.5">
                {layer.map((id) => (
                  <div
                    key={id}
                    className="max-w-[220px] rounded-xl border border-line bg-background px-3.5 py-2.5 text-center"
                  >
                    <p className="text-[12.5px] leading-snug font-semibold">{nodes.get(id)}</p>
                  </div>
                ))}
              </div>
              {i < layers.length - 1 ? (
                <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-1">
                  {edges.length > 0 ? (
                    <span className="text-[14px] leading-none text-muted">→</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
