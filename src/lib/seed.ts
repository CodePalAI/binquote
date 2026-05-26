// Run with: npm run seed
// Forces a re-seed of the demo operator's pricing rules.
import { db, saveOperator } from "./db";
import { defaultRules } from "./seed-defaults";

db(); // ensure init
saveOperator(defaultRules);
console.log(`Seeded operator: ${defaultRules.operator_slug}`);
