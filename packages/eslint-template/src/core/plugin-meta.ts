// CHANGE: plugin metadata constants
// WHY: avoid runtime require in ESM
// QUOTE(TZ): n/a
// REF: AGENTS.md CORE
// SOURCE: n/a
// FORMAT THEOREM: name,version,namespace are non-empty
// PURITY: CORE
// EFFECT: n/a
// INVARIANT: name != "" ∧ version != "" ∧ namespace != ""
// COMPLEXITY: O(1)/O(1)
export const name = "@prover-coder-ai/eslint-plugin-suggest-members"
export const version = "0.0.0"
export const namespace = "suggest-members"
