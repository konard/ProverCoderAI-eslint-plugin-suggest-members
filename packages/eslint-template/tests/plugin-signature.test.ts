import type { TSESLint } from "@typescript-eslint/utils"
import { describe, expect, it } from "vitest"

import plugin from "../src/index.js"

type PluginRules = NonNullable<TSESLint.FlatConfig.Plugin["rules"]>
type PluginRule = PluginRules[string]

const assertNonEmptyString = (value: string | undefined): void => {
  expect(typeof value).toBe("string")
  if (typeof value === "string") {
    expect(value.length).toBeGreaterThan(0)
  }
}

const assertRuleShape = (rule: PluginRule | undefined): void => {
  expect(rule).toBeDefined()
}

const isConfigArray = (
  config: TSESLint.FlatConfig.Config | ReadonlyArray<TSESLint.FlatConfig.Config>
): config is ReadonlyArray<TSESLint.FlatConfig.Config> => Array.isArray(config)

const assertConfigShape = (
  config: TSESLint.FlatConfig.Config | ReadonlyArray<TSESLint.FlatConfig.Config> | undefined
): void => {
  expect(config).toBeDefined()
  if (!config) return

  const configList = isConfigArray(config) ? config : [config]
  expect(configList.length).toBeGreaterThan(0)

  for (const entry of configList) {
    expect(entry.rules).toBeDefined()
    if (entry.rules) {
      expect(Object.keys(entry.rules).length).toBeGreaterThan(0)
    }
    expect(entry.plugins).toBeDefined()
    if (entry.plugins) {
      expect(Object.keys(entry.plugins).length).toBeGreaterThan(0)
    }
  }
}

describe("eslint plugin signature", () => {
  it("satisfies eslint plugin signature", () => {
    const pluginTyped: TSESLint.FlatConfig.Plugin = plugin
    expect(pluginTyped).toBe(plugin)
  })

  it("exposes meta with name and version", () => {
    const pluginTyped: TSESLint.FlatConfig.Plugin = plugin
    assertNonEmptyString(pluginTyped.meta?.name)
    assertNonEmptyString(pluginTyped.meta?.version)
  })

  it("exposes rules with valid shape", () => {
    const pluginTyped: TSESLint.FlatConfig.Plugin = plugin
    const rules = pluginTyped.rules
    expect(rules).toBeDefined()
    if (!rules) return

    const ruleNames = Object.keys(rules)
    expect(ruleNames.length).toBeGreaterThan(0)
    for (const ruleName of ruleNames) {
      assertRuleShape(rules[ruleName])
    }
  })

  it("exposes recommended configs", () => {
    const pluginTyped: TSESLint.FlatConfig.Plugin = plugin
    const configs = pluginTyped.configs
    expect(configs).toBeDefined()
    if (!configs) return

    const configNames: ReadonlyArray<"recommended" | "flat/recommended"> = [
      "recommended",
      "flat/recommended"
    ]
    for (const configName of configNames) {
      assertConfigShape(configs[configName])
    }
  })
})
