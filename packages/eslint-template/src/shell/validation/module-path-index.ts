// CHANGE: module path index from TypeScript program
// WHY: allow sync module-path validation without direct filesystem access
// QUOTE(TZ): n/a
// REF: AGENTS.md CORE↔SHELL
// SOURCE: n/a
// PURITY: SHELL
// EFFECT: n/a
// INVARIANT: index contains only supported file extensions
// COMPLEXITY: O(n)/O(n)
import * as S from "@effect/schema/Schema"
import * as Either from "effect/Either"
import * as ts from "typescript"

import { SUPPORTED_EXTENSIONS } from "../../core/validation/candidates.js"

export interface ModulePathIndex {
  readonly localFiles: ReadonlyArray<string>
  readonly localFileSet: ReadonlySet<string>
  readonly packageNames: ReadonlyArray<string>
  readonly packageNameSet: ReadonlySet<string>
}

const normalizePath = (value: string): string => value.replaceAll("\\", "/")

const isSupportedFile = (filePath: string): boolean => SUPPORTED_EXTENSIONS.some((ext) => filePath.endsWith(ext))

const PackageJsonSchema = S.Struct({
  dependencies: S.Record({ key: S.String, value: S.String }),
  devDependencies: S.Record({ key: S.String, value: S.String }),
  peerDependencies: S.Record({ key: S.String, value: S.String }),
  optionalDependencies: S.Record({ key: S.String, value: S.String })
}).pipe(S.partial)

type PackageJson = S.Schema.Type<typeof PackageJsonSchema>

const decodePackageJson = S.decodeUnknownEither(S.parseJson(PackageJsonSchema))

const extractDependencyKeys = (
  value: Readonly<Record<string, string>> | undefined
): ReadonlyArray<string> => (value ? Object.keys(value) : [])

const mergeUnique = (
  chunks: ReadonlyArray<ReadonlyArray<string>>
): ReadonlyArray<string> => {
  const unique = new Set<string>()
  for (const chunk of chunks) {
    for (const name of chunk) {
      if (name.length > 0) {
        unique.add(name)
      }
    }
  }
  return [...unique]
}

const extractPackageNames = (value: PackageJson): ReadonlyArray<string> => {
  const sections: ReadonlyArray<keyof PackageJson> = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies"
  ]
  const chunks = sections.map((section) => extractDependencyKeys(value[section]))
  return mergeUnique(chunks)
}

const parsePackageJson = (content: string): PackageJson | null =>
  Either.match(decodePackageJson(content), {
    onLeft: () => null,
    onRight: (value) => value
  })

const dirname = (value: string): string => {
  const normalized = normalizePath(value)
  const lastSlash = normalized.lastIndexOf("/")
  if (lastSlash <= 0) return normalized
  return normalized.slice(0, lastSlash)
}

const joinPath = (...segments: ReadonlyArray<string>): string => normalizePath(segments.join("/"))

const findNearestPackageJson = (startDir: string): string | null => {
  let currentDir = normalizePath(startDir)
  let parentDir = dirname(currentDir)

  while (currentDir !== parentDir) {
    const candidate = joinPath(currentDir, "package.json")
    if (ts.sys.fileExists(candidate)) return candidate
    currentDir = parentDir
    parentDir = dirname(currentDir)
  }

  const rootCandidate = joinPath(currentDir, "package.json")
  return ts.sys.fileExists(rootCandidate) ? rootCandidate : null
}

const readPackageNamesFromNearest = (
  startDir: string
): ReadonlyArray<string> => {
  const packageJsonPath = findNearestPackageJson(startDir)
  if (!packageJsonPath) return []
  const content = ts.sys.readFile(packageJsonPath)
  if (!content) return []
  const parsed = parsePackageJson(content)
  return parsed ? extractPackageNames(parsed) : []
}

const moduleIndexCache = new WeakMap<ts.Program, ModulePathIndex>()

export const buildModulePathIndex = (program: ts.Program): ModulePathIndex => {
  const localFiles: Array<string> = []
  const packageNames = new Set<string>()

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue
    const normalized = normalizePath(sourceFile.fileName)
    if (normalized.includes("/node_modules/")) continue

    if (isSupportedFile(normalized)) {
      localFiles.push(normalized)
    }
  }

  const packageFromManifest = readPackageNamesFromNearest(program.getCurrentDirectory())
  for (const name of packageFromManifest) {
    packageNames.add(name)
  }

  const uniqueFiles = [...new Set(localFiles)]
  return {
    localFiles: uniqueFiles,
    localFileSet: new Set(uniqueFiles),
    packageNames: [...packageNames],
    packageNameSet: new Set(packageNames)
  }
}

export const getModulePathIndex = (program: ts.Program): ModulePathIndex => {
  const cached = moduleIndexCache.get(program)
  if (cached) return cached
  const computed = buildModulePathIndex(program)
  moduleIndexCache.set(program, computed)
  return computed
}
