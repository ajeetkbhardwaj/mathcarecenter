/** Post-build report: what the static analysis expects to be served. */
import { source } from "../src/lib/source";

const pages = source.allPages();
const byCollection = source.order.map((key) => ({
  collection: source.collections[key].label,
  pages: source.pages(key).length,
}));

console.log("✓ post-build content summary");
for (const row of byCollection) console.log(`  ${row.collection}: ${row.pages} pages`);
console.log(`  total: ${pages.length} pages`);
