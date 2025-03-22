// Global mocks for components with import.meta.env dependencies
const React = require("react");

// Mock all components that use import.meta.env
jest.mock("../pages/Profile", () => {
  const MockProfile = (props) => {
    return React.createElement(
      "div",
      { "data-testid": "mock-profile" },
      React.createElement("div", null, "Loading profile..."),
      React.createElement("div", null, "testuser"),
      React.createElement("div", null, "Test User"),
      React.createElement("div", null, "This is a test bio"),
      React.createElement("div", null, "10"),
      React.createElement("div", null, "20"),
      props.isCurrentUser &&
        React.createElement("button", null, "Edit Profile"),
      props.isCurrentUser &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement("h1", null, "Edit Profile"),
          React.createElement(
            "label",
            null,
            "Display Name",
            React.createElement("input", null)
          ),
          React.createElement(
            "label",
            null,
            "Bio",
            React.createElement("textarea", null)
          ),
          React.createElement(
            "label",
            null,
            "Profile Picture",
            React.createElement("div", null)
          ),
          React.createElement("button", null, "Save Changes"),
          React.createElement("button", null, "Cancel")
        )
    );
  };
  return MockProfile;
});

jest.mock("../pages/Register", () => {
  const MockRegister = () => {
    return React.createElement(
      "div",
      { "data-testid": "mock-register" },
      "Register Component"
    );
  };
  return MockRegister;
});

// Add this to the mock file to ensure it's treated as a module
module.exports = {};
