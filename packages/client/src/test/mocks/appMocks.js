const React = require("react");

// Mock the core components used in App.tsx
jest.mock("../../components/Navigation", () => {
  return function MockNavigation() {
    return React.createElement(
      "nav",
      { "data-testid": "navigation" },
      "Navigation"
    );
  };
});

jest.mock("../../pages/Login", () => {
  return function MockLogin() {
    return React.createElement(
      "div",
      { "data-testid": "login-page" },
      "Login Page"
    );
  };
});

jest.mock("../../pages/Register", () => {
  return function MockRegister() {
    return React.createElement(
      "div",
      { "data-testid": "register-page" },
      "Register Page"
    );
  };
});

jest.mock("../../pages/Home", () => {
  return function MockHome() {
    return React.createElement(
      "div",
      { "data-testid": "home-page" },
      "Home Page"
    );
  };
});

jest.mock("../../pages/Profile", () => {
  return function MockProfile(props) {
    return React.createElement(
      "div",
      { "data-testid": "profile-page" },
      `Profile Page ${props.isCurrentUser ? "(Current User)" : ""}`
    );
  };
});

// Create a ProtectedRoute mock - this is safer than trying to import a file that may not exist
jest.mock(
  "../../components/ProtectedRoute",
  () => {
    // Simply pass children through
    return {
      __esModule: true,
      default: ({ children }) => children,
    };
  },
  { virtual: true }
); // Use virtual: true to avoid requiring the actual file

module.exports = {};
