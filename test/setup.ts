import { Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { setup, teardown } from './helpers/dbHelper';
import { createTestApp } from './helpers/testApp';

let testApp: Express.Application;
let mongoDb: Db;
let mongoServer: MongoMemoryServer;
