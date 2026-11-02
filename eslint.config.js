// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/**"],
    rules: {
      // FFmpeg is loaded only in standalone native builds; it is intentionally
      // absent from the Expo/web dependency graph.
      "import/no-unresolved": "off",
      "@typescript-eslint/no-require-imports": "off",
      "import/first": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/array-type": "off",
      "no-unused-expressions": "off",
      "react-hooks/exhaustive-deps": "off",
      "import/no-named-as-default-member": "off",
    },
  },
]);
