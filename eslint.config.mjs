// @ts-check

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.strict,
  eslintPluginUnicorn.configs["flat/recommended"],
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: true },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "sort-imports": [
        "error",
        {
          allowSeparatedGroups: true,
          ignoreMemberSort: true,
        },
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
      "unicorn/no-process-exit": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            Db: true,
            Dir: true,
            Env: true,
            Param: true,
            Params: true,
            Props: true,
            Ref: true,
            acc: true,
            args: true,
            db: true,
            dir: true,
            e2e: true,
            env: true,
            fn: true,
            params: true,
            props: true,
            ref: true,
          },
        },
      ],
    },
  },
];
