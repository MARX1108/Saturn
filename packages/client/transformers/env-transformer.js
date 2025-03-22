/**
 * This is a custom transformer for Jest to handle import.meta.env
 * which is a Vite-specific feature not available in Jest
 */
const { transform } = require("@babel/core");

module.exports = {
  process(src, filename, config, options) {
    // Replace import.meta.env with global.ENV
    const transformed = src
      .replace(/import\.meta\.env/g, "global.ENV")
      .replace(/process\.env/g, "global.ENV");

    // Use Babel to transform TypeScript and ESM
    const result = transform(transformed, {
      filename,
      presets: [
        "@babel/preset-env",
        "@babel/preset-typescript",
        ["@babel/preset-react", { runtime: "automatic" }],
      ],
      plugins: ["@babel/plugin-transform-modules-commonjs"],
      babelrc: false,
      configFile: false,
    });

    return { code: result.code };
  },
};
