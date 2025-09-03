/* integrity check to ensure key files exist */
import fs from "fs";
import path from "path";

const required = [
  "package.json",
  "tsconfig.json",
  "src/utils/http/correlation.ts",
];

let ok = true;
for (const rel of required) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) {
    console.error("[integrity] Missing:", rel);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("[integrity] OK");
