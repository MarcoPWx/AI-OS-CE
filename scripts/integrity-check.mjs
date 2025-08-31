/* integrity check to ensure key files exist */
import fs from "fs";
import path from "path";

const required = [
  ".storybook/main.ts",
  ".storybook/preview.tsx",
  "src/stories/Epics/EpicManagerImproved.stories.tsx",
  "src/stories/API/Playground.stories.tsx",
  "src/stories/Dev/NetworkPlayground.stories.tsx",
  "src/stories/Status/StatusDashboard.stories.tsx",
  "src/stories/Docs/DevLog.stories.tsx",
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
