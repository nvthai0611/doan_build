import { createClient } from 'redis';

export const redis = createClient()
  .on('error', (err) => console.log('Redis client error', err))
  .connect();
