import { ServiceContainer } from '../utils/container';
import { DbUser } from '../models/user';
import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      services: ServiceContainer;
      user?: DbUser;
      file?: Express.Multer.File;
    }
  }
}

export {};
