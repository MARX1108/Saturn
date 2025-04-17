import express from 'express';
import { Db } from 'mongodb';

export async function createTestApp(db: Db, domain: string) {
  const app = express();

  // Add test ping route for debugging
  app.get('/test-ping', (req, res) => {
    console.log('!!! DEBUG: /test-ping endpoint reached !!!');
    res.status(200).send('pong');
  });

  return app;
}
