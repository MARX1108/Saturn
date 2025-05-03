// jest.config.js
module.exports = {
  preset: "react-native",
  testTimeout: 30000,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\.(js|jsx|ts|tsx)$": "babel-jest",
  },
};
