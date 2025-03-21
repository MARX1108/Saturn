import express from 'express';
import { MongoClient } from 'mongodb';
import apex from 'activitypub-express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fyp-saturn';
const DOMAIN = process.env.DOMAIN || 'localhost:4000';

async function startServer() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();

    // Initialize ActivityPub Express
    const apexOptions = {
      name: 'FYP Saturn',
      domain: DOMAIN,
      actorParam: 'actor',
      objectParam: 'id',
      routes: {
        actor: '/u/:actor',
        object: '/o/:id',
        activity: '/s/:id',
        inbox: '/u/:actor/inbox',
        outbox: '/u/:actor/outbox',
        followers: '/u/:actor/followers',
        following: '/u/:actor/following',
        liked: '/u/:actor/liked',
      },
      endpoints: {
        proxyUrl: `https://${DOMAIN}/proxy`,
        uploadMedia: `https://${DOMAIN}/upload`,
        main: `https://${DOMAIN}/`,
      },
      // Use MongoDB for storage
      storage: {
        db,
        // Collections
        activities: 'apex_activities',
        actors: 'apex_actors',
        objects: 'apex_objects',
        streams: 'apex_streams',
      },
    };

    const apexInstance = apex(apexOptions);
    
    // Use ActivityPub Express
    app.use(apexInstance);
    
    // Add JSON middleware
    app.use(express.json());
    
    // Add a route to create an actor
    app.post('/api/create-actor', async (req, res) => {
      try {
        const { username, displayName } = req.body;
        
        if (!username) {
          return res.status(400).json({ error: 'Username is required' });
        }
        
        // Check if actor already exists
        const existingActor = await db.collection('apex_actors').findOne({ preferredUsername: username });
        if (existingActor) {
          return res.status(409).json({ error: 'Actor already exists' });
        }
        
        // Generate actor ID
        const actorId = `https://${DOMAIN}/u/${username}`;
        
        // Generate key pair
        const { publicKey, privateKey } = await apexInstance.createKeypair();
        
        // Create actor
        const actorData = {
          id: actorId,
          type: 'Person',
          preferredUsername: username,
          name: displayName || username,
          inbox: `${actorId}/inbox`,
          outbox: `${actorId}/outbox`,
          followers: `${actorId}/followers`,
          following: `${actorId}/following`,
          liked: `${actorId}/liked`,
          publicKey: {
            id: `${actorId}#main-key`,
            owner: actorId,
            publicKeyPem: publicKey
          },
          privateKey: privateKey
        };
        
        await db.collection('apex_actors').insertOne(actorData);
        
        return res.status(201).json({
          success: true,
          actor: {
            id: actorId,
            preferredUsername: username,
            name: displayName || username
          }
        });
      } catch (error) {
        console.error('Error creating actor:', error);
        return res.status(500).json({ error: 'Failed to create actor' });
      }
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 FYP Saturn server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
