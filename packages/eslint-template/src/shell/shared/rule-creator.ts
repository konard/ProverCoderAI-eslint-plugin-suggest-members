// CHANGE: shared RuleCreator wrapper with docs URL
// WHY: consistent rule metadata + docs linking across rules
// QUOTE(TZ): n/a
// REF: AGENTS.md SHELL
// SOURCE: n/a
// FORMAT THEOREM: ∀r ∈ RuleName: docsUrl(r) is total
// PURITY: SHELL
// EFFECT: RuleModule creation
// INVARIANT: meta.messages contains messageId
// COMPLEXITY: O(1)/O(1)
import { ESLintUtils } from "@typescript-eslint/utils"
import type { RuleContext, RuleListener, RuleModule } from "@typescript-eslint/utils/ts-eslint"

import type { RuleName } from "../../core/rule-names.js"
import { ruleDocsUrl } from "../../core/rule-names.js"

export interface RuleMetaInput<TMessageId extends string> {
  readonly description: string
  readonly messageId: TMessageId
}

export const createRule = <
  TMessageId extends string,
  TOptions extends ReadonlyArray<string>
>(
  ruleName: RuleName,
  meta: RuleMetaInput<TMessageId>,
  buildListener: (context: RuleContext<TMessageId, TOptions>) => RuleListener,
  defaultOptions: TOptions
): RuleModule<TMessageId, TOptions> => {
  const create = ESLintUtils.RuleCreator(() => ruleDocsUrl(ruleName))
  const messages: Record<string, string> = {
    [meta.messageId]: "{{message}}"
  }

  return create({
    name: ruleName,
    meta: {
      type: "problem",
      docs: {
        description: meta.description
      },
      messages,
      schema: []
    },
    defaultOptions,
    create: buildListener
  })
}
