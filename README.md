# 🪐 FYP Saturn

[![codecov](https://codecov.io/gh/marx1108/FYP-Saturn/branch/main/graph/badge.svg)](https://codecov.io/gh/marx1108/Saturn)

A federated social platform using ActivityPub with integrated AI capabilities.

## Getting Started

### Prerequisites

- Node.js v16+
- Yarn package manager
- MongoDB (or use Docker)

### Development

1. Start MongoDB:

```bash
docker-compose up -d mongodb
```

### Scripts

```json
{
  "scripts": {
    // ...existing scripts...
    "test:coverage": "vitest run --coverage",
    "coverage:report": "vitest run --coverage && codecov -f coverage/lcov.info -F server"
  },
  "devDependencies": {
    // ...existing dependencies...
    "@vitest/coverage-c8": "latest"
  }
}
```

### Vitest Configuration

```typescript
// In packages/client/vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    coverage: {
      provider: "c8", // or "v8"
      reporter: ["text", "lcov", "html"],
      exclude: [
        "**/*.d.ts",
        "**/node_modules/**",
        "**/dist/**",
        "**/coverage/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*",
      ],
    },
  },
});
```

```typescript
// In packages/server/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "c8", // or "v8"
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.ts", "routes/**/*.ts"],
      exclude: ["src/types/**", "**/*.d.ts"],
    },
    setupFiles: ["./test/setup.ts"],
  },
});
```

### GitHub Actions

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./packages/client/coverage/lcov.info,./packages/server/coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false
```
