import { Request, Response, Application } from 'express';
import { ServerPlugin } from './index';

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

  onNewPost(postData: any) {
    console.log('New post created:', postData.id);
  },
};

export default helloPlugin;
