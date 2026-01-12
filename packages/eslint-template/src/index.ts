// CHANGE: plugin entrypoint
// WHY: export rules + recommended config
// QUOTE(TZ): n/a
// REF: AGENTS.md plugin composition
// SOURCE: n/a
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: rules map contains all rule names
// COMPLEXITY: O(1)/O(1)
import type { TSESLint } from "@typescript-eslint/utils"
import type { Linter } from "eslint"

import { name, namespace, version } from "./core/plugin-meta.js"
import { RULE_NAMES } from "./core/rule-names.js"
import { rules } from "./rules/index.js"

type PluginBase = Omit<TSESLint.FlatConfig.Plugin, "configs">

type PluginWithConfigs = PluginBase & {
  readonly configs: {
    readonly recommended: TSESLint.FlatConfig.Config
    readonly "flat/recommended": TSESLint.FlatConfig.Config
  }
}

const pluginBase: PluginBase = {
  meta: { name, version },
  rules
}

const buildRecommendedRules = (): Linter.RulesRecord => {
  const entries: Linter.RulesRecord = {}
  for (const ruleName of RULE_NAMES) {
    entries[`${namespace}/${ruleName}`] = "error"
  }
  return entries
}

const recommendedRules = buildRecommendedRules()

const flatRecommended: TSESLint.FlatConfig.Config = {
  plugins: {
    [namespace]: pluginBase
  },
  rules: recommendedRules
}

const plugin: PluginWithConfigs = {
  ...pluginBase,
  configs: {
    recommended: flatRecommended,
    "flat/recommended": flatRecommended
  }
}

export default plugin

export const configs = plugin.configs

export { rules } from "./rules/index.js"
