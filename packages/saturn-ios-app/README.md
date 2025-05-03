# Saturn iOS App (MVP)

[![Status](https://img.shields.io/badge/status-active-success.svg)]() The official iOS application for Saturn, an open-source, decentralized social media platform focused on user control, privacy, and customization. This package contains the React Native (Expo) implementation for the iOS MVP.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Yarn](https://yarnpkg.com/) (v1.x - Classic)
- [Watchman](https://facebook.github.io/watchman/) (Recommended for macOS)
- [Xcode](https://developer.apple.com/xcode/) and Xcode Command Line Tools
- [CocoaPods](https://cocoapods.org/) (`sudo gem install cocoapods`)
- An iOS Simulator set up via Xcode, or a physical iOS device.
- Access to the Saturn Backend API running locally (typically at `http://localhost:4000`). Refer to the `packages/server` README for backend setup.

## Getting Started

1.  **Clone the Repository:**

    ```bash
    git clone <your-repo-url> # Replace with actual repo URL
    cd Saturn # Navigate to the root directory
    ```

2.  **Install Dependencies:** Navigate to the root directory and install dependencies for all packages using Yarn.

    ```bash
    yarn install
    ```

3.  **Configure Environment:**

    - Ensure the Saturn backend server (`packages/server`) is running.
    - Set up necessary environment variables if required (e.g., for Sentry DSN). Create a `.env` file in `packages/saturn-ios-app/` if needed (ensure it's gitignored). Example:
      ```env
      # packages/saturn-ios-app/.env
      EXPO_PUBLIC_SENTRY_DSN=YOUR_SENTRY_DSN_GOES_HERE
      ```

4.  **Run the Application (iOS):** Navigate to the app directory and start the development server.
    ```bash
    cd packages/saturn-ios-app
    yarn ios
    ```
    This will typically build the app and launch it on a connected device or simulator. Follow the prompts in the terminal.

## Available Scripts

Within the `packages/saturn-ios-app` directory, the following scripts are available via Yarn:

- `yarn start`: Starts the Metro bundler (Expo development server).
- `yarn ios`: Starts the app on an iOS simulator or connected device.
- `yarn android`: Starts the app on an Android emulator or connected device (Setup may require Android Studio).
- `yarn web`: Starts the app in a web browser (Experimental).
- `yarn lint`: Lints the codebase using ESLint.
- `yarn test`: Runs unit/integration tests using Jest. _(Note: Currently may fail due to workspace setup/server tests)._
- `yarn test:contract`: Runs consumer-driven contract tests using Pact. _(Note: Currently blocked by Jest/RN environment issues)._
- `npx prettier --check .`: Checks code formatting using Prettier.
- `npx tsc --noEmit`: Performs a TypeScript type check.

## Tech Stack

- **Framework:** React Native (with Expo SDK)
- **Language:** TypeScript (Strict)
- **Navigation:** React Navigation (v7+)
- **State Management:**
  - Global: Redux Toolkit (RTK)
  - Server Cache: TanStack Query (React Query v5+)
- **Styling:** Styled Components
- **API Client:** Axios
- **Testing:**
  - Unit/Integration: Jest + React Native Testing Library (RNTL)
  - Contract: Pact JS
  - E2E: TBD (Detox/Maestro planned)
- **Linting:** ESLint
- **Formatting:** Prettier
- **Monitoring:** Sentry

## Contributing

Please refer to the main repository's `CONTRIBUTING.md` (if available) for contribution guidelines. Ensure code passes linting, formatting, and type checks before submitting pull requests.

_(Add sections for Architecture Overview, Folder Structure explanation, etc. as the project evolves)._
