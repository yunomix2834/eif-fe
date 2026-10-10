import path from "node:path";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import ts from "typescript";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const moduleCache = new Map();

export function loadTypeScript(relativePath) {
  const filename = path.resolve(projectRoot, relativePath);
  if (moduleCache.has(filename)) return moduleCache.get(filename).exports;

  const loadedModule = { exports: {} };
  moduleCache.set(filename, loadedModule);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const nodeRequire = createRequire(filename);
  function requireModule(specifier) {
    if (specifier.startsWith("@global/") || specifier.startsWith("@modules/")) {
      return loadTypeScript(`src/${specifier.slice(1)}.ts`);
    }
    return nodeRequire(specifier);
  }

  const evaluate = new Script(
    `(function(exports, require, module) {\n${outputText}\n})`,
    { filename },
  );
  evaluate.runInThisContext()(
    loadedModule.exports,
    requireModule,
    loadedModule,
  );
  return loadedModule.exports;
}
