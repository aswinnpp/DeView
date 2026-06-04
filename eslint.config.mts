import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

const reactHooksPlugin = {
  rules: reactHooks.rules,
};

export default defineConfig([
  // Ignore generated folders
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },

  // Main config
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // React
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
    
      // TypeScript strict but usable
      "@typescript-eslint/no-explicit-any": "error",
    
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    
      // Allow logical expressions (condition && fn())
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
    
      // Backend patterns
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-prototype-builtins": "off",
    
      // Hooks
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,
]);