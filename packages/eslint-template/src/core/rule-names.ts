// CHANGE: centralize rule names + docs URL
// WHY: single source of truth for rule ids and documentation mapping
// QUOTE(TZ): n/a
// REF: AGENTS.md CORE
// SOURCE: n/a
// FORMAT THEOREM: ∀r ∈ RULE_NAMES: ruleDocsUrl(r) is total
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: RULE_NAMES are unique
// COMPLEXITY: O(1)/O(1)

export type RuleName =
  | "suggest-exports"
  | "suggest-imports"
  | "suggest-members"
  | "suggest-missing-names"
  | "suggest-module-paths"

export const RULE_NAMES: ReadonlyArray<RuleName> = [
  "suggest-exports",
  "suggest-imports",
  "suggest-members",
  "suggest-missing-names",
  "suggest-module-paths"
]

const RULE_DOCS_BASE_URL =
  "https://github.com/ProverCoderAI/eslint-plugin-suggest-members/blob/main/packages/eslint-template/docs/rules"

export const ruleDocsUrl = (ruleName: RuleName): string => `${RULE_DOCS_BASE_URL}/${ruleName}.md`
