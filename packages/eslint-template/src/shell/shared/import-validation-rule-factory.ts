// CHANGE: rule factory for import/export validations
// WHY: shared listener wiring
// QUOTE(TZ): n/a
// REF: AGENTS.md SHELL
// SOURCE: n/a
// PURITY: SHELL
// EFFECT: ESLint rule creation
// INVARIANT: listeners are deterministic
// COMPLEXITY: O(1)/O(n)
import type { TSESTree } from "@typescript-eslint/utils"
import { AST_NODE_TYPES } from "@typescript-eslint/utils"
import type { RuleContext, RuleListener, RuleModule } from "@typescript-eslint/utils/ts-eslint"

import type { RuleName } from "../../core/rule-names.js"
import { isTypeOnlyImport } from "../../core/validators/index.js"
import type { ImportValidationConfig, TypeScriptServiceLayerContext } from "./import-validation-base.js"
import {
  createTypeScriptServiceLayerForContext,
  validateExportSpecifierBase,
  validateImportSpecifierBase
} from "./import-validation-base.js"
import { createRule } from "./rule-creator.js"

const defaultOptions: ReadonlyArray<string> = []

const getModulePathFromImport = (node: TSESTree.ImportDeclaration): string | undefined =>
  typeof node.source.value === "string" ? node.source.value : undefined

const getModulePathFromExport = (
  node: TSESTree.ExportNamedDeclaration
): string | undefined => typeof node.source?.value === "string" ? node.source.value : undefined

const buildImportListeners = <TResult>(
  context: RuleContext<string, ReadonlyArray<string>>,
  config: ImportValidationConfig<TResult>
): RuleListener => {
  const tsService = createTypeScriptServiceLayerForContext(context)

  return {
    ImportDeclaration(node: TSESTree.ImportDeclaration): void {
      if (isTypeOnlyImport(node)) return
      const modulePath = getModulePathFromImport(node)
      if (!modulePath) return

      for (const specifier of node.specifiers) {
        if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
          validateImportSpecifierBase(
            specifier,
            modulePath,
            config,
            context,
            tsService
          )
        }
      }
    }
  }
}

export const createExportValidationListener = <TResult>(
  context: RuleContext<string, ReadonlyArray<string>>,
  config: ImportValidationConfig<TResult>
): RuleListener => {
  const tsService: TypeScriptServiceLayerContext = createTypeScriptServiceLayerForContext(context)

  return {
    ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void {
      const modulePath = getModulePathFromExport(node)
      if (!modulePath) return

      for (const specifier of node.specifiers) {
        validateExportSpecifierBase(
          specifier,
          modulePath,
          config,
          context,
          tsService
        )
      }
    }
  }
}

const makeValidationRule = <TResult>(
  buildListener: (
    context: RuleContext<string, ReadonlyArray<string>>,
    config: ImportValidationConfig<TResult>
  ) => RuleListener
) =>
(
  ruleName: RuleName,
  description: string,
  messageId: string,
  config: ImportValidationConfig<TResult>
): RuleModule<string, ReadonlyArray<string>> =>
  createRule(
    ruleName,
    {
      description,
      messageId
    },
    (context) => buildListener(context, config),
    defaultOptions
  )

export const createValidationRule = makeValidationRule(buildImportListeners)
export const createExportValidationRule = makeValidationRule(createExportValidationListener)
