import path from "node:path";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, rm } from "node:fs/promises";

const sourceDir = path.resolve("out");
const targetArg = process.argv[2] || process.env.EIF_BACKEND_STATIC_DIR;

if (!targetArg) {
  console.error(
    "Usage: npm run copy:backend -- ../backend/web/static\n" +
      "or set EIF_BACKEND_STATIC_DIR.",
  );
  process.exit(1);
}

if (!existsSync(sourceDir)) {
  console.error("Missing ./out. Run `npm run build` first.");
  process.exit(1);
}

const targetDir = path.resolve(targetArg);
const unsafeTargets = new Set([
  path.parse(targetDir).root,
  process.cwd(),
  path.resolve("."),
]);
if (unsafeTargets.has(targetDir)) {
  console.error(`Refusing unsafe destination: ${targetDir}`);
  process.exit(1);
}

await mkdir(targetDir, { recursive: true });
for (const entry of await readdir(targetDir)) {
  if (entry === ".gitkeep") {
    continue;
  }
  await rm(path.join(targetDir, entry), { recursive: true, force: true });
}

await cp(sourceDir, targetDir, { recursive: true });
console.log(`Copied ${sourceDir} -> ${targetDir}`);
