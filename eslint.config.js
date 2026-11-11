import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintReact from "@eslint-react/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Ignore build output
  globalIgnores(["dist", "dist-demo", "node_modules"]),

  // ── JS / JSX ──────────────────────────────────────────────────────────────
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // override — разрешить const-реэкспорты компонентов (Tabs = Primitive.Root и т.д.)
      {
        rules: { "react-refresh/only-export-components": ["warn", { allowConstantExport: true }] },
      },
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Переменные.
      // destructuredArrayIgnorePattern покрывает { icon: Icon } — Icon начинается с заглавной.
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // ── TS / TSX ──────────────────────────────────────────────────────────────
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "@eslint-react": eslintReact,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
        // project: true — раскомментируй если нужны type-aware правила (медленнее)
        // project: ["./tsconfig.json"],
      },
      globals: globals.browser,
    },
    rules: {
      // TS-специфичные
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React (@eslint-react; @typescript-eslint/no-unused-vars already counts <Icon /> as a use)
      "@eslint-react/no-missing-key": "error",
      "@eslint-react/dom-no-unknown-property": "error",
      "@eslint-react/dom-no-unsafe-target-blank": "error",

      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]);
