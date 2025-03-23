const React = require("react");

// Create specific mocks for Login page test
jest.mock("../../pages/Login", () => {
  return function MockLogin() {
    return React.createElement("div", { "data-testid": "login-page" }, [
      React.createElement("form", { "data-testid": "login-form" }, [
        React.createElement("input", {
          placeholder: "Username",
          name: "username",
          key: "username-input",
        }),
        React.createElement("input", {
          placeholder: "Password",
          name: "password",
          type: "password",
          key: "password-input",
        }),
        React.createElement(
          "button",
          {
            type: "submit",
            key: "submit-button",
          },
          "Log In"
        ),
      ]),
    ]);
  };
});

// Create specific mocks for Register page test
jest.mock("../../pages/Register", () => {
  return function MockRegister() {
    return React.createElement("div", { "data-testid": "register-page" }, [
      React.createElement("form", { "data-testid": "register-form" }, [
        React.createElement("input", {
          placeholder: "Username",
          name: "username",
          key: "username-input",
        }),
        React.createElement("input", {
          placeholder: "Email",
          name: "email",
          type: "email",
          key: "email-input",
        }),
        React.createElement("input", {
          placeholder: "Password",
          name: "password",
          type: "password",
          key: "password-input",
        }),
        React.createElement("input", {
          placeholder: "Confirm Password",
          name: "confirmPassword",
          type: "password",
          key: "confirm-input",
        }),
        React.createElement(
          "button",
          {
            type: "submit",
            key: "submit-button",
          },
          "Create Account"
        ),
      ]),
    ]);
  };
});

// Create specific mock for AITest component
jest.mock("../../components/AITest", () => {
  return function MockAITest() {
    return React.createElement("div", { className: "ai-test glass-card" }, [
      React.createElement(
        "h2",
        { className: "section-title", key: "title" },
        "AI Test Environment"
      ),
      React.createElement("div", { className: "model-status", key: "status" }, [
        React.createElement("p", { key: "status-text" }, [
          "Model Status: ",
          React.createElement("span", { key: "status-val" }, "ready"),
        ]),
        React.createElement(
          "button",
          { className: "gradient-button", key: "load-btn" },
          "Load Model"
        ),
      ]),
      React.createElement(
        "div",
        { className: "form-group", key: "prompt-group" },
        [
          React.createElement(
            "label",
            { htmlFor: "prompt", key: "prompt-label" },
            "Test Prompt:"
          ),
          React.createElement("textarea", {
            className: "input-field",
            id: "prompt",
            placeholder: "Enter a prompt to test the AI...",
            key: "prompt-input",
          }),
        ]
      ),
      React.createElement(
        "button",
        { className: "gradient-button", key: "gen-btn" },
        "Generate"
      ),
      React.createElement(
        "div",
        { className: "form-group", key: "analyze-group" },
        [
          React.createElement(
            "label",
            { htmlFor: "content", key: "content-label" },
            "Content to Analyze:"
          ),
          React.createElement("textarea", {
            className: "input-field",
            id: "content",
            placeholder: "Enter your text here",
            key: "content-input",
          }),
        ]
      ),
      React.createElement(
        "button",
        { className: "gradient-button", key: "analyze-btn" },
        "Analyze Sentiment"
      ),
    ]);
  };
});

module.exports = {};
