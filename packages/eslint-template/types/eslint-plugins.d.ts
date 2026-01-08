declare module "eslint-plugin-sort-destructure-keys" {
	import type { ESLint } from "eslint";

	const plugin: ESLint.Plugin;
	export default plugin;
}

declare module "@eslint-community/eslint-plugin-eslint-comments/configs" {
	import type { Linter } from "eslint";

	const configs: {
		readonly recommended: Linter.Config;
	};
	export default configs;
}

declare module "@prover-coder-ai/eslint-plugin-suggest-members-aliased" {
	import type plugin from "../src/index.js";

	const exported: typeof plugin;
	export default exported;
}
