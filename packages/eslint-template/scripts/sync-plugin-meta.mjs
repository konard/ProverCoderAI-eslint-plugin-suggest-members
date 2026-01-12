// CHANGE: sync plugin-meta.ts with package.json
// WHY: keep plugin meta version/name aligned with package version
// QUOTE(TZ): n/a
// REF: AGENTS.md build-time sync
// SOURCE: n/a
// PURITY: SHELL
// EFFECT: fs read/write
// INVARIANT: plugin-meta.version == package.json.version
// COMPLEXITY: O(1)/O(1)
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageJsonPath = path.join(scriptDir, "..", "package.json")
const pluginMetaPath = path.join(scriptDir, "..", "src", "core", "plugin-meta.ts")

const rawPackage = fs.readFileSync(packageJsonPath, "utf8")
const packageJson = JSON.parse(rawPackage)

const name = typeof packageJson.name === "string" ? packageJson.name : ""
const version = typeof packageJson.version === "string" ? packageJson.version : ""

const deriveNamespace = (packageName) => {
  if (!packageName) return ""
  if (packageName.startsWith("@")) {
    const parts = packageName.split("/")
    return parts.length > 1 ? parts[1] : packageName.slice(1)
  }
  return packageName
}

const namespace = deriveNamespace(name)

if (name.length === 0 || version.length === 0) {
  throw new Error("sync-plugin-meta: invalid package.json (name/version)")
}

const toLiteral = (value) => JSON.stringify(value)

const content = `// CHANGE: plugin metadata constants (auto-generated)
// WHY: keep meta version in sync with package.json
// QUOTE(TZ): n/a
// REF: AGENTS.md CORE
// SOURCE: n/a
// FORMAT THEOREM: name,version,namespace are non-empty
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: name != "" && version != "" && namespace != ""
// COMPLEXITY: O(1)/O(1)
export const name = ${toLiteral(name)}
export const version = ${toLiteral(version)}
export const namespace = ${toLiteral(namespace)}
`

fs.writeFileSync(pluginMetaPath, content)
