import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

// Define options if your plugin accepts any
export interface HelloPluginOptions {
  greeting?: string;
}

// Define the plugin logic
async function helloPlugin(
  fastify: FastifyInstance,
  options: HelloPluginOptions
) {
  const greeting = options.greeting || 'Hello';

  // Decorate Fastify instance
  fastify.decorate('hello', (name: string) => `${greeting}, ${name}!`);

  // Add a hook
  fastify.addHook('onRequest', async (request, reply) => {
    console.log('👋 Hello Plugin: onRequest hook triggered!');
  });

  // Example: Log when a post is created
  fastify.addHook('onSend', async (request, reply, payload) => {
    // Check if the route is for creating a post and successful
    if (
      request.method === 'POST' &&
      (request.url.includes('/api/posts') || request.url.includes('/posts')) &&
      reply.statusCode === 201
    ) {
      try {
        // Attempt to parse payload as JSON to access post data
        const postData = JSON.parse(payload as string);

        // Use optional chaining and nullish coalescing for safety
        const authorUsername = postData?.author?.username ?? 'unknown author';

        console.log(
          `👋 Hello Plugin says: New post created by ${authorUsername}!`
        );
      } catch (error) {
        // Payload might not be JSON or might be empty
        console.log(
          '👋 Hello Plugin says: New post created! (Could not parse author)'
        );
      }
    }
  });

  console.log('👋 Hello Plugin registered!');
}

// Export the plugin using fastify-plugin
export default fp(helloPlugin, {
  fastify: '4.x', // Specify the Fastify version constraint
  name: 'hello-plugin',
});
