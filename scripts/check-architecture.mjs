import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

const projectRoot = process.cwd();
const boundaryRules = [
  {
    directory: path.join(projectRoot, "src", "global"),
    forbidden: ["@modules/", "@/modules/"],
    message: "global must not depend on feature modules",
  },
  {
    directory: path.join(projectRoot, "src", "modules"),
    forbidden: ["@/app/", "@app/"],
    message: "feature modules must not depend on app composition",
  },
];

async function collectSourceFiles(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(fullPath)));
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

let hasFailure = false;

for (const rule of boundaryRules) {
  for (const file of await collectSourceFiles(rule.directory)) {
    const content = await readFile(file, "utf8");

    for (const specifier of rule.forbidden) {
      if (!content.includes(specifier)) {
        continue;
      }

      hasFailure = true;
      console.error(
        `${path.relative(projectRoot, file)}: ${rule.message} (${specifier})`,
      );
    }
  }
}

if (hasFailure) {
  process.exitCode = 1;
} else {
  console.log("Architecture boundaries: OK");
}
