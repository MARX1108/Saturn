module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [
    "<rootDir>/src/test/setup.ts",
    "<rootDir>/jest.setup.js",
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    // Add this to handle import.meta.env in components
    "^import\\.meta\\.env\\.(.*)$": "<rootDir>/src/test/environment.ts",
  },
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        isolatedModules: true,
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/vite-env.d.ts",
    "!**/node_modules/**",
  ],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
