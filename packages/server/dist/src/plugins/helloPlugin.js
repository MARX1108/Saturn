'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const helloPlugin = {
  name: 'hello-plugin',
  version: '1.0.0',
  init(app) {
    console.log('Hello plugin initialized!');
    // Add a sample route
    app.get('/api/hello', (req, res) => {
      res.json({ message: 'Hello from the plugin system!' });
    });
  },
  hooks: {
    // Example hook: Log when a new user is created
    // onNewUser: (data: HookData) => {
    //   console.log('New user hook triggered:', data);
    // }
  },
  onNewPost: postData => {
    // Check if actor data exists before accessing username
    const authorUsername = postData.actor?.username || 'an unknown user';
    console.log(`👋 Hello Plugin says: New post created by ${authorUsername}!`);
  },
};
exports.default = helloPlugin;
