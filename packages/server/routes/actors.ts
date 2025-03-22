import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ActorService } from '../src/services/actorService';
import { CreateActorRequest } from '../src/types/actor';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to initialize actorService with database connection
const initActorService = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.app.locals.db) {
    return res.status(500).json({ error: 'Database connection not available' });
  }
  
  const domain = process.env.DOMAIN || 'localhost:4000';
  req.actorService = new ActorService(req.app.locals.db, domain);
  next();
};

// Apply this middleware to all routes in this router
router.use(initActorService);

// Create new actor
router.post('/actors', upload.single('avatarFile'), async (req, res) => {
  try {
    const { username, displayName, bio } = req.body;
    const avatarFile = req.file;
    
    // Validate required fields
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Validate username (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }
    
    // Check if username already exists
    const exists = await req.actorService.usernameExists(username);
    if (exists) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Handle avatar
    let iconInfo = undefined;
    if (avatarFile) {
      // Move to permanent storage in public directory
      const publicDir = path.join(process.cwd(), 'public', 'avatars');
      fs.mkdirSync(publicDir, { recursive: true });
      
      const fileExt = path.extname(avatarFile.originalname);
      const fileName = `${username}-${Date.now()}${fileExt}`;
      const finalPath = path.join(publicDir, fileName);
      
      fs.renameSync(avatarFile.path, finalPath);
      
      const domain = process.env.DOMAIN || 'localhost:4000';
      iconInfo = {
        url: `https://${domain}/avatars/${fileName}`,
        mediaType: avatarFile.mimetype
      };
    }
    
    // Create actor data
    const actorData: CreateActorRequest = {
      username,
      displayName,
      bio
    };
    
    // Create actor through service
    const actor = await req.actorService.createActor(actorData, iconInfo);
    
    return res.status(201).json(actor);
  } catch (error) {
    console.error('Error creating actor:', error);
    return res.status(500).json({ error: 'Failed to create actor' });
  }
});

// Get actor by username
router.get('/actors/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const actor = await req.actorService.getActorByUsername(username);
    
    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    
    return res.json(actor);
  } catch (error) {
    console.error('Error fetching actor:', error);
    return res.status(500).json({ error: 'Failed to fetch actor' });
  }
});

// Update actor
router.put('/actors/:username', upload.single('avatarFile'), async (req, res) => {
  try {
    const { username } = req.params;
    const { displayName, bio } = req.body;
    const avatarFile = req.file;
    
    // Check if actor exists
    const exists = await req.actorService.usernameExists(username);
    if (!exists) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    
    // Handle avatar update
    let iconInfo = undefined;
    if (avatarFile) {
      // Move to permanent storage
      const publicDir = path.join(process.cwd(), 'public', 'avatars');
      fs.mkdirSync(publicDir, { recursive: true });
      
      const fileExt = path.extname(avatarFile.originalname);
      const fileName = `${username}-${Date.now()}${fileExt}`;
      const finalPath = path.join(publicDir, fileName);
      
      fs.renameSync(avatarFile.path, finalPath);
      
      const domain = process.env.DOMAIN || 'localhost:4000';
      iconInfo = {
        url: `https://${domain}/avatars/${fileName}`,
        mediaType: avatarFile.mimetype
      };
    }
    
    // Update actor
    const updates = {
      displayName,
      bio
    };
    
    const updatedActor = await req.actorService.updateActor(username, updates, iconInfo);
    
    if (!updatedActor) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    
    return res.json(updatedActor);
  } catch (error) {
    console.error('Error updating actor:', error);
    return res.status(500).json({ error: 'Failed to update actor' });
  }
});

// Delete actor (optional)
router.delete('/actors/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const deleted = await req.actorService.deleteActor(username);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting actor:', error);
    return res.status(500).json({ error: 'Failed to delete actor' });
  }
});

// Get ActivityPub actor profile (federated)
router.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check Accept header for ActivityPub requests
    const acceptHeader = req.get('Accept');
    if (!acceptHeader || !acceptHeader.includes('application/activity+json')) {
      // Redirect to user profile page for browsers
      return res.redirect(`/profile/${username}`);
    }
    
    const actor = await req.actorService.getFullActorByUsername(username);
    
    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    
    // Return ActivityPub compliant actor
    return res.json({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1"
      ],
      ...actor
    });
  } catch (error) {
    console.error('Error fetching ActivityPub actor:', error);
    return res.status(500).json({ error: 'Failed to fetch actor' });
  }
});

export default router;