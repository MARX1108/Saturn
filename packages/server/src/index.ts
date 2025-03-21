import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fyp-saturn';

// Import plugin system
import { registerPlugin, initPlugins } from './plugins';
import helloPlugin from './plugins/helloPlugin';

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    const db = client.db();

    // Middleware
    app.use(express.json());
    app.use(cors()); // Enable CORS for all routes
    
    console.log('Initializing server...');
    
    // Register plugins
    registerPlugin(helloPlugin);
    initPlugins(app);
    
    // Create a user/actor
    app.post('/api/create-actor', async (req, res) => {
      try {
        const { username, displayName } = req.body;
        
        if (!username) {
          return res.status(400).json({ error: 'Username is required' });
        }
        
        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ username });
        if (existingUser) {
          return res.status(409).json({ error: 'Username already exists' });
        }
        
        // Create a new user
        const user = {
          username,
          displayName: displayName || username,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert into database
        await db.collection('users').insertOne(user);
        
        return res.status(201).json({
          success: true,
          user
        });
      } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Failed to create user' });
      }
    });
    
    // Get a user
    app.get('/api/user/:username', async (req, res) => {
      try {
        const { username } = req.params;
        
        // Find user in database
        const user = await db.collection('users').findOne({ username });
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        return res.json({ user });
      } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
    });
    
    // List users
    app.get('/api/users', async (req, res) => {
      try {
        const users = await db.collection('users').find().toArray();
        return res.json({ users });
      } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 FYP Saturn server running at http://localhost:${PORT}`);
      console.log(`API is available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();