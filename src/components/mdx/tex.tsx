import katex from "katex";
import { Fragment } from "react";

type Segment = { math: boolean; value: string };

/**
 * Splits a string into prose and `$…$` / `$$…$$` math segments so that
 * MDX attribute values such as
 * `explanation="Both bounds tend to $1$, therefore …"` render correctly.
 */
function segment(source: string): Segment[] {
  const parts: Segment[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(source))) {
    if (match.index > last) parts.push({ math: false, value: source.slice(last, match.index) });
    parts.push({ math: true, value: (match[1] ?? match[2] ?? "").trim() });
    last = match.index + match[0].length;
  }
  if (last < source.length) parts.push({ math: false, value: source.slice(last) });

  return parts.filter((p) => p.value.length > 0);
}

function render(latex: string, display: boolean) {
  const html = katex.renderToString(latex, {
    displayMode: display,
    throwOnError: false,
    strict: false,
    trust: false,
    output: "html",
  });
  return html;
}

/**
 * Renders LaTeX with KaTeX. Deterministic, so it is safe on both the server
 * and the client (no hydration mismatch). Prose and math can be interleaved.
 */
export function Tex({
  children,
  display = false,
  className,
}: {
  children: string;
  display?: boolean;
  className?: string;
}) {
  const source = String(children ?? "");

  try {
    if (!source.includes("$")) {
      return (
        <span
          className={className}
          dangerouslySetInnerHTML={{ __html: render(source, display) }}
        />
      );
    }

    return (
      <span className={className}>
        {segment(source).map((s, i) => (
          <Fragment key={i}>
            {s.math ? (
              <span dangerouslySetInnerHTML={{ __html: render(s.value, display) }} />
            ) : (
              s.value
            )}
          </Fragment>
        ))}
      </span>
    );
  } catch {
    return <code className={className}>{source}</code>;
  }
}
