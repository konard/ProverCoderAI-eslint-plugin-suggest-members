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

const normalizePath = (value: string): string => value.replaceAll("\\", "/")

const createProgramForPackage = (
  packageDir: string,
  currentDirectory: string
): ts.Program => {
  const configPath = ts.findConfigFile(packageDir, (f) => ts.sys.fileExists(f), "tsconfig.json")
  if (!configPath) throw new Error(`No tsconfig.json found in ${packageDir}`)

  const configFile = ts.readConfigFile(configPath, (f) => ts.sys.readFile(f))
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    packageDir
  )

  const host = ts.createCompilerHost(parsedConfig.options, true)
  host.getCurrentDirectory = () => currentDirectory

  return ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
    host
  })
}

describe("buildModulePathIndex", () => {
  describe("monorepo package discovery", () => {
    let index: ModulePathIndex
    let program: ts.Program
    const fixtureMonorepoDir = path.join(
      rootDir,
      "packages",
      "eslint-template",
      "tests",
      "fixtures",
      "monorepo"
    )
    const consumerDir = path.join(fixtureMonorepoDir, "packages", "consumer")

    beforeAll(() => {
      program = createProgramForPackage(consumerDir, fixtureMonorepoDir)
      index = buildModulePathIndex(program)
    })

    it("should reproduce the root cause: program current directory is the workspace root (not the package dir)", () => {
      expect(normalizePath(program.getCurrentDirectory())).toBe(normalizePath(fixtureMonorepoDir))
    })

    it("should discover dependencies from package-level package.json, not just workspace root", () => {
      expect(index.packageNameSet.has("dep-from-consumer")).toBe(true)
    })

    it("should discover workspace sibling package names", () => {
      expect(index.packageNameSet.has("@acme/provider")).toBe(true)
      expect(index.packageNames.length).toBeGreaterThan(0)
    })

    it("should include workspace root dependencies", () => {
      expect(index.packageNameSet.has("dep-from-root")).toBe(true)
    })

    it("should provide canResolveModule fallback for non-existent packages", () => {
      expect(index.canResolveModule).toBeDefined()
      const mainFile = path.join(consumerDir, "src", "index.ts")
      expect(index.canResolveModule?.("non-existent-package-xyz", mainFile)).toBe(false)
    })

    it("should collect local source files excluding node_modules", () => {
      expect(index.localFiles.length).toBeGreaterThan(0)
      expect(index.localFiles.some((f) => f.includes("/node_modules/"))).toBe(false)
    })
  })
})
