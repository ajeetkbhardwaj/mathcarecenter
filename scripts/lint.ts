import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readDirRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(readDirRecursive(res));
    } else if (entry.name.endsWith(".mdx")) {
      files.push(res);
    }
  }
  return files;
}

export function lintContent(): string[] {
  const problems: string[] = [];
  const files = readDirRecursive(CONTENT_DIR);

  for (const file of files) {
    const rel = path.relative(CONTENT_DIR, file);
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);

    if (!data.title) problems.push(`${rel}: missing 'title' in frontmatter`);
    if (!data.description) problems.push(`${rel}: missing 'description' in frontmatter`);

    for (const match of content.matchAll(/\]\((\/[^)\s]+)\)/g)) {
      const target = match[1].split("#")[0];
      const knownPrefixes = ["/", "/courses", "/pricing", "/login", "/register", "/dashboard", "/docs", "/blog"];
      if (!knownPrefixes.some((p) => target === p || target.startsWith(p))) {
        problems.push(`${rel}: unknown internal link '${target}'`);
      }
    }
  }

  return problems;
}

const problems = lintContent();
if (problems.length > 0) {
  console.error(`✗ ${problems.length} content problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
} else {
  console.log(`✓ ${readDirRecursive(CONTENT_DIR).length} MDX files validated cleanly.`);
}
