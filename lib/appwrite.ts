import { Client, Databases, Storage } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

export const databases = new Databases(client);
export const storage = new Storage(client);

export const DB_ID = process.env.APPWRITE_DATABASE_ID || 'auroric-db';
export const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'auroric-images';

// Collection IDs
export const USERS_COL = 'users';
export const PINS_COL = 'pins';
export const BOARDS_COL = 'boards';
export const NOTIFICATIONS_COL = 'notifications';
