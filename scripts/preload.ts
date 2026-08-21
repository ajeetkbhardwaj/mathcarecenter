/**
 * Warms the curriculum tables so the first request never pays seeding cost.
 * Safe to run repeatedly — seeding is idempotent.
 */
import { ensureSeeded } from "../src/lib/seed";

async function main() {
  await ensureSeeded();
  console.log("✓ preload: curriculum tables ready");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("preload failed:", err);
      process.exit(1);
    });
}

export { main as preload };
