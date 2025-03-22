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
    // Use a simple module for import.meta.env
    "import\\.meta\\.env\\.VITE_API_URL": "<rootDir>/src/test/envMock.js",
    "import\\.meta\\.env": "<rootDir>/src/test/envMock.js",
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
  testEnvironmentOptions: {
    customExportConditions: ["react-jsx"],
  },
  // Transform our test environment files
  transformIgnorePatterns: [
    "/node_modules/(?!(@testing-library/react|@testing-library/dom)/)",
  ],
};
