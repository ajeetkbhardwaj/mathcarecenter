import { lintContent } from "./lint";

const problems = lintContent();
if (problems.length > 0) {
  console.error("Content validation failed before build:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log("✓ Pre-build content validation passed cleanly.");
