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
  onNewPost(postData) {
    console.log(
      `👋 Hello Plugin says: New post created by ${postData.actor.username}!`
    );
  },
};
exports.default = helloPlugin;
