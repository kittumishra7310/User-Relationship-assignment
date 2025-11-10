import Redis from 'ioredis';

// Redis client for caching and synchronization
let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  // Only create Redis client if REDIS_URL is provided
  if (!process.env.REDIS_URL) {
    console.log('Redis not configured - running without cache');
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error('Redis connection failed after 3 retries');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      });

      redis.on('error', (err) => {
        console.error('Redis error:', err);
      });

      redis.on('connect', () => {
        console.log('Redis connected successfully');
      });
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      return null;
    }
  }

  return redis;
}

// Cache keys
export const CACHE_KEYS = {
  ALL_USERS: 'users:all',
  USER: (id: string) => `user:${id}`,
  GRAPH_DATA: 'graph:data',
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  USERS: 60, // 1 minute
  GRAPH: 60, // 1 minute
};

// Helper functions for caching
export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttl: number): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error('Redis invalidate error:', error);
  }
}

// Pub/Sub for cross-worker synchronization
export async function publishUpdate(channel: string, message: any): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.publish(channel, JSON.stringify(message));
  } catch (error) {
    console.error('Redis publish error:', error);
  }
}

export function subscribeToUpdates(channel: string, callback: (message: any) => void): void {
  const client = getRedisClient();
  if (!client) return;

  const subscriber = client.duplicate();
  
  subscriber.subscribe(channel, (err) => {
    if (err) {
      console.error('Redis subscribe error:', err);
      return;
    }
    console.log(`Subscribed to channel: ${channel}`);
  });

  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      try {
        callback(JSON.parse(message));
      } catch (error) {
        console.error('Error processing Redis message:', error);
      }
    }
  });
}
