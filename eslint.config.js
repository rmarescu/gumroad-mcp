import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default [
  includeIgnoreFile(fileURLToPath(import.meta.resolve("./.gitignore"))),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: {
            memberTypes: [
              "static-field",
              "static-method",

              "public-instance-field",
              "protected-instance-field",
              "private-instance-field",

              "constructor",
              "get",
              "set",

              "public-method",
              "protected-method",
              "private-method",
            ],
          },
        },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "arrow-body-style": ["error", "as-needed"],
      eqeqeq: ["error", "smart"],
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
          },
          groups: ["builtin", "external", "internal", ["parent", "sibling"], "index", "object", "type"],
          "newlines-between": "always",
        },
      ],
      "logical-assignment-operators": "error",
      "no-alert": "error",
      "no-else-return": "error",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-lone-blocks": "error",
      "no-lonely-if": "error",
      "no-useless-call": "error",
      "no-useless-computed-key": "error",
      "no-var": "error",
      "object-shorthand": "error",
      // "padding-line-between-statements": ["error", { blankLine: "always", next: "*", prev: "import" }],
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-numeric-literals": "error",
      "prefer-object-spread": "error",
      "prefer-promise-reject-errors": "error",
      "prefer-spread": "error",
      "require-await": "error",
      "sort-keys": ["error", "asc", { caseSensitive: true, natural: false }],
    },
  },
];
