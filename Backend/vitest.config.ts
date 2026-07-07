import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      LLM_PROVIDER: "local-fallback"
    },
    coverage: {
      provider: "v8"
    }
  }
});
