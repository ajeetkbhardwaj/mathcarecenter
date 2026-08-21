import type { HTMLAttributes, ReactNode } from "react";
import type { PluggableList } from "unified";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tex } from "@/components/mdx/tex";

/* ------------------------------------------------------------------ */
/* LaTeX protection                                                    */
/* ------------------------------------------------------------------ */

function toTemplateLiteral(latex: string) {
  return (
    "`" +
    latex
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$\{/g, "\\${") +
    "`"
  );
}

const MATH_OR_TAG =
  /(<\/?[A-Za-z][A-Za-z0-9.]*[\s\S]*?\/?>)|(\$\$([\s\S]+?)\$\$)|(\$([^$\n]+?)\$)/g;

export function protectMath(source: string): string {
  return source.replace(MATH_OR_TAG, (match, tag, blockAll, block, inlineAll, inline) => {
    if (tag) return match;
    if (block !== undefined) {
      const tex = block.replace(/\s*\n\s*/g, " ").trim();
      return `\n\n<MathBlock tex={${toTemplateLiteral(tex)}} />\n\n`;
    }
    if (inline !== undefined) {
      return `<MathInline tex={${toTemplateLiteral(inline)}} />`;
    }
    return match;
  });
}

/* ------------------------------------------------------------------ */
/* Heading slugifier                                                   */
/* ------------------------------------------------------------------ */

function textOfNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOfNode).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return textOfNode(props?.children ?? "");
  }
  return "";
}

export function slugify(node: ReactNode): string {
  return textOfNode(node)
    .toLowerCase()
    .replace(/\$[^$]*\$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Heading2({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const id = slugify(children);
  return (
    <h2 id={id} className="group scroll-mt-24" {...props}>
      <a href={`#${id}`} className="no-underline transition-opacity hover:opacity-80">
        {children}
      </a>
    </h2>
  );
}

function Heading3({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const id = slugify(children);
  return (
    <h3 id={id} className="group scroll-mt-24" {...props}>
      <a href={`#${id}`} className="no-underline transition-opacity hover:opacity-80">
        {children}
      </a>
    </h3>
  );
}

function Heading4({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const id = slugify(children);
  return (
    <h4 id={id} className="group scroll-mt-24" {...props}>
      {children}
    </h4>
  );
}

/* ------------------------------------------------------------------ */
/* Presentational helpers                                              */
/* ------------------------------------------------------------------ */

function MathBlock({ tex }: { tex: string }) {
  return (
    <span className="block overflow-x-auto py-1">
      <Tex display>{tex}</Tex>
    </span>
  );
}

function MathInline({ tex }: { tex: string }) {
  return <Tex>{tex}</Tex>;
}

function TheoremBox({
  title,
  number,
  children,
}: {
  title?: string;
  number?: string;
  children?: ReactNode;
}) {
  return (
    <div className="not-prose my-6 rounded-xl border border-l-4 border-l-[var(--accent-blue)] border-line bg-surface p-5 shadow-xs">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded bg-[color-mix(in_oklab,var(--accent-blue)_12%,transparent)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--accent-blue)] uppercase">
          Theorem {number ? `· ${number}` : ""}
        </span>
        {title ? <span className="text-[15px] font-bold text-foreground">{title}</span> : null}
      </div>
      <div className="prose-math text-[15.5px] leading-relaxed">{children}</div>
    </div>
  );
}

function Callout({
  type = "note",
  title,
  children,
}: {
  type?: "note" | "warning" | "tip";
  title?: string;
  children?: ReactNode;
}) {
  const map = {
    note: { icon: <Info className="size-4" />, color: "var(--accent-blue)", label: "Note" },
    warning: {
      icon: <AlertTriangle className="size-4" />,
      color: "var(--accent-amber)",
      label: "Caution",
    },
    tip: { icon: <CheckCircle2 className="size-4" />, color: "var(--accent-emerald)", label: "Tip" },
  } as const;
  const c = map[type];

  return (
    <div className="not-prose my-6 flex gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
      <span className="mt-0.5 shrink-0" style={{ color: c.color }}>
        {c.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: c.color }}>
          {title ?? c.label}
        </p>
        <div className="prose-math text-[14.5px] leading-relaxed text-muted [&>*+*]:mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

export const mdxComponents = {
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  TheoremBox,
  Callout,
  MathBlock,
  MathInline,
};

export function useMDXComponents(components: Record<string, unknown> = {}) {
  return {
    ...mdxComponents,
    ...components,
  };
}

export type { MDXComponents } from "mdx/types";

/* ------------------------------------------------------------------ */
/* Compiler                                                            */
/* ------------------------------------------------------------------ */

export async function renderMdx(source: string): Promise<ReactNode> {
  const { default: Content } = await evaluate(protectMath(source), {
    ...runtime,
    useMDXComponents,
    remarkPlugins: [] as PluggableList,
    rehypePlugins: [] as PluggableList,
  });
  return <Content components={mdxComponents} />;
}

export type TocItem = { id: string; text: string; depth: number };

export function extractToc(source: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (!m) continue;
    const text = m[2].replace(/[*`_]/g, "").replace(/\$[^$]*\$/g, "").trim();
    if (!text) continue;
    const id = slugify(text);
    items.push({ id, text, depth: m[1].length });
  }
  return items;
}
