import { ServerPlugin } from './index';

const helloPlugin: ServerPlugin = {
  name: 'hello-plugin',
  version: '1.0.0',
  
  init(app) {
    console.log('Hello plugin initialized!');
    
    // Add a sample route
    app.get('/api/hello', (req, res) => {
      res.json({ message: 'Hello from the plugin system!' });
    });
  },
  
  onNewPost(postData) {
    console.log('New post created:', postData.id);
  }
};

export default helloPlugin;
