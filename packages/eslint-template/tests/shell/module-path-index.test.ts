import path from "node:path"
import { fileURLToPath } from "node:url"

import * as ts from "typescript"
import { beforeAll, describe, expect, it } from "vitest"

import type { ModulePathIndex } from "../../src/shell/validation/module-path-index.js"
import { buildModulePathIndex } from "../../src/shell/validation/module-path-index.js"

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  ".."
)

const createProgramForPackage = (packageDir: string): ts.Program => {
  const configPath = ts.findConfigFile(packageDir, (f) => ts.sys.fileExists(f), "tsconfig.json")
  if (!configPath) throw new Error(`No tsconfig.json found in ${packageDir}`)

  const configFile = ts.readConfigFile(configPath, (f) => ts.sys.readFile(f))
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    packageDir
  )

  return ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options
  })
}

describe("buildModulePathIndex", () => {
  describe("monorepo package discovery", () => {
    let index: ModulePathIndex
    const appDir = path.join(rootDir, "packages", "app")

    beforeAll(() => {
      const program = createProgramForPackage(appDir)
      index = buildModulePathIndex(program)
    })

    it("should discover dependencies from package-level package.json, not just workspace root", () => {
      expect(index.packageNameSet.has("effect")).toBe(true)
      expect(index.packageNameSet.has("@effect/platform")).toBe(true)
      expect(index.packageNameSet.has("@effect/platform-node")).toBe(true)
    })

    it("should discover workspace sibling package names", () => {
      expect(index.packageNameSet.has("@prover-coder-ai/eslint-plugin-suggest-members")).toBe(true)
      expect(index.packageNames.length).toBeGreaterThan(0)
    })

    it("should include workspace root dependencies", () => {
      expect(index.packageNameSet.has("typescript")).toBe(true)
    })

    it("should provide canResolveModule fallback for non-existent packages", () => {
      expect(index.canResolveModule).toBeDefined()
      const mainFile = path.join(appDir, "src", "app", "main.ts")
      expect(index.canResolveModule?.("non-existent-package-xyz", mainFile)).toBe(false)
    })

    it("should collect local source files excluding node_modules", () => {
      expect(index.localFiles.length).toBeGreaterThan(0)
      expect(index.localFiles.some((f) => f.includes("/node_modules/"))).toBe(false)
    })
  })
})
