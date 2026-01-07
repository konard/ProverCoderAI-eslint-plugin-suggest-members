// CHANGE: Effect helpers for optional fallbacks
// WHY: de-duplicate error-to-undefined mappings in SHELL
// QUOTE(TZ): n/a
// REF: AGENTS.md SHELL
// SOURCE: n/a
// PURITY: SHELL
// EFFECT: Effect
// INVARIANT: failure -> undefined, success -> value
// COMPLEXITY: O(1)/O(1)
import { Effect } from "effect"

export const ignoreErrorToUndefined = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A | undefined, never, R> =>
  Effect.matchEffect(effect, {
    onFailure: () => Effect.sync((): A | undefined => undefined),
    onSuccess: (value) => Effect.succeed(value)
  })
