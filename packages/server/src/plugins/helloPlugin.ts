import { Request, Response, Application } from 'express';
import { ServerPlugin, HookData } from './index';
import { Post } from '@/modules/posts/models/post';

const helloPlugin: ServerPlugin = {
  name: 'hello-plugin',
  version: '1.0.0',

  init(app: Application) {
    console.log('Hello plugin initialized!');

    // Add a sample route
    app.get('/api/hello', (req: Request, res: Response) => {
      res.json({ message: 'Hello from the plugin system!' });
    });
  },

  hooks: {
    // Example hook: Log when a new user is created
    // onNewUser: (data: HookData) => {
    //   console.log('New user hook triggered:', data);
    // }
  },

  onNewPost: (postData: Post): void => {
    // Check if actor data exists before accessing username
    const authorUsername = postData.actor?.username || 'an unknown user';
    console.log(`👋 Hello Plugin says: New post created by ${authorUsername}!`);
  },
};

export default helloPlugin;
