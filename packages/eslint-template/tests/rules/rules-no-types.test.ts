import * as tsParser from "@typescript-eslint/parser"
import { RuleTester } from "@typescript-eslint/rule-tester"

import { rules } from "../../src/rules/index.js"
import "../utils/rule-tester.js"

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    }
  }
})

const baseCase = {
  code: "const value = 1; value;",
  filename: "no-types.ts"
}

for (const [ruleName, rule] of Object.entries(rules)) {
  ruleTester.run(`${ruleName} (no type info)`, rule, {
    valid: [
      {
        ...baseCase,
        filename: `no-types-${ruleName}.ts`
      }
    ],
    invalid: []
  })
}
