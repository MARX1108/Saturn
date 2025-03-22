import "@testing-library/jest-dom";

// Fix for window.ENV
interface Window {
  ENV: {
    VITE_API_URL: string;
    [key: string]: any;
  };
}

// Fix for global.ENV
declare global {
  var ENV: {
    VITE_API_URL: string;
    [key: string]: any;
  };
}

// Export to make it a module
export {};
