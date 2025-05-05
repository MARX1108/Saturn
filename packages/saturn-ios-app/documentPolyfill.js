// This file is a polyfill to fix the 'document doesn't exist' error
// in styled-components and Sentry when running in React Native

if (typeof document === 'undefined') {
  // Create minimal document implementation to avoid errors
  global.document = {
    createElement: (tag) => ({
      setAttribute: () => {},
      // Add basic style property for elements like iframes
      style: {},
    }),
    head: {
      // Add appendChild for Sentry checks
      appendChild: () => {},
      // Add removeChild for Sentry checks
      removeChild: () => {},
    },
    createTextNode: () => ({}),
    querySelectorAll: () => [],
    styleSheets: [],
    // Add addEventListener for Sentry DOM instrumentation
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

// Ensure window is defined with the appropriate navigator product
if (typeof window === 'undefined') {
  global.window = {
    navigator: {
      product: 'ReactNative',
    },
    // Add minimal style sheet implementation
    StyleSheet: {
      insertRule: () => {},
      cssRules: [],
    },
    // Add minimal location implementation to avoid '.href' errors
    location: {
      href: '',
    },
    // Add fetch mock for Sentry checks
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    // Add addEventListener for Sentry DOM instrumentation
    addEventListener: () => {},
    removeEventListener: () => {},
  };
} else {
  // If window exists, ensure necessary properties are defined
  global.window.location = global.window.location || { href: '' };
  global.window.addEventListener = global.window.addEventListener || (() => {});
  global.window.removeEventListener =
    global.window.removeEventListener || (() => {});
  global.window.fetch =
    global.window.fetch ||
    (() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
}

// Force styled-components to use the native version
// This happens before any imports in the app
if (global.__DEV__) {
  console.log('Document & Window polyfill loaded');
}
