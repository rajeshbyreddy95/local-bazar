import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let redisConnected = false;
let useUpstash = false;

// Simple in-memory cache fallback
const memoryCache = new Map<string, { data: any; expiry: number }>();

// Upstash REST client
class UpstashRedis {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  private async request(command: string[], options?: { returnRaw?: boolean }) {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error(`Upstash error: ${response.statusText}`);
      }

      const data = await response.json();
      return options?.returnRaw ? data : data.result;
    } catch (error) {
      console.error('Upstash request error:', error);
      throw error;
    }
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
    const command = ['SET', key, value];
    if (options?.EX) {
      command.push('EX', options.EX.toString());
    }
    return this.request(command);
  }

  async get(key: string): Promise<string | null> {
    return this.request(['GET', key]);
  }

  async del(key: string): Promise<number> {
    return this.request(['DEL', key]);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.request(['KEYS', pattern]);
  }

  async connect(): Promise<void> {
    // Test connection
    try {
      await this.request(['PING']);
      console.log('✅ Connected to Upstash Redis');
      redisConnected = true;
    } catch (error) {
      console.error('Failed to connect to Upstash:', error);
      throw error;
    }
  }
}

let upstashClient: UpstashRedis | null = null;

export async function connectRedis(): Promise<RedisClientType | UpstashRedis | null> {
  // Check if Upstash credentials are provided
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (upstashClient) {
      return upstashClient;
    }

    try {
      upstashClient = new UpstashRedis(
        process.env.UPSTASH_REDIS_REST_URL,
        process.env.UPSTASH_REDIS_REST_TOKEN
      );
      await upstashClient.connect();
      useUpstash = true;
      return upstashClient;
    } catch (error) {
      console.log('⚠️  Upstash unavailable. Switching to memory cache fallback');
      return null;
    }
  }

  // Fallback to regular Redis
  if (redisClient && redisConnected) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('⚠️  Redis: Max retries exceeded. Using memory cache fallback');
            redisConnected = false;
            return false;
          }
          return Math.min(retries * 50, 500);
        },
      },
    });

    redisClient.on('error', (err) => {
      redisConnected = false;
      console.error('⚠️  Redis error (using memory cache fallback):', err.message);
    });

    redisClient.on('connect', () => {
      redisConnected = true;
      console.log('✅ Connected to Redis');
    });

    await redisClient.connect();
    redisConnected = true;
    return redisClient;
  } catch (error) {
    console.log('⚠️  Redis unavailable. Switching to memory cache fallback');
    redisConnected = false;
    return null;
  }
}

export async function getRedisClient(): Promise<RedisClientType | UpstashRedis | null> {
  if (useUpstash) {
    if (!upstashClient) {
      return connectRedis();
    }
    return upstashClient;
  }

  if (!redisClient) {
    return connectRedis();
  }
  return redisConnected ? redisClient : null;
}

// Cache functions with fallback to memory
export async function cacheSet(key: string, value: any, ttl: number = 3600): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client && (redisConnected || useUpstash)) {
      if (useUpstash && upstashClient) {
        // Upstash REST API
        await upstashClient.set(key, JSON.stringify(value), { EX: ttl });
        console.log(`📝 Cached (Upstash): ${key}`);
      } else if (redisClient) {
        // Regular Redis
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        console.log(`📝 Cached (Redis): ${key}`);
      }
    } else {
      // Fallback to memory cache
      memoryCache.set(key, {
        data: value,
        expiry: Date.now() + ttl * 1000,
      });
      console.log(`📝 Cached (Memory): ${key}`);
    }
  } catch (error) {
    // Fallback to memory cache
    memoryCache.set(key, {
      data: value,
      expiry: Date.now() + ttl * 1000,
    });
    console.log(`📝 Cached (Memory fallback): ${key}`);
  }
}

export async function cacheGet(key: string): Promise<any> {
  try {
    const client = await getRedisClient();
    if (client && (redisConnected || useUpstash)) {
      if (useUpstash && upstashClient) {
        // Upstash REST API
        const data = await upstashClient.get(key);
        if (data) {
          console.log(`✅ Cache HIT (Upstash): ${key}`);
          return JSON.parse(data);
        }
      } else if (redisClient) {
        // Regular Redis
        const data = await redisClient.get(key);
        if (data) {
          console.log(`✅ Cache HIT (Redis): ${key}`);
          return JSON.parse(data);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Redis get error for ${key}, checking memory cache`);
  }

  // Check memory cache
  const cached = memoryCache.get(key);
  if (cached) {
    if (Date.now() < cached.expiry) {
      console.log(`✅ Cache HIT (Memory): ${key}`);
      return cached.data;
    } else {
      // Expired
      memoryCache.delete(key);
    }
  }

  console.log(`❌ Cache MISS: ${key}`);
  return null;
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client && (redisConnected || useUpstash)) {
      if (useUpstash && upstashClient) {
        // Upstash REST API
        await upstashClient.del(key);
        console.log(`🗑️  Cache deleted (Upstash): ${key}`);
      } else if (redisClient) {
        // Regular Redis
        await redisClient.del(key);
        console.log(`🗑️  Cache deleted (Redis): ${key}`);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Redis delete error for ${key}`);
  }

  // Also delete from memory cache
  memoryCache.delete(key);
  console.log(`🗑️  Cache deleted (Memory): ${key}`);
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client && (redisConnected || useUpstash)) {
      if (useUpstash && upstashClient) {
        // Upstash REST API - pattern delete
        const keys = await upstashClient.keys(pattern);
        if (keys && keys.length > 0) {
          for (const key of keys) {
            await upstashClient.del(key);
          }
          console.log(`🗑️  Deleted ${keys.length} Upstash cache entries matching: ${pattern}`);
        }
      } else if (redisClient) {
        // Regular Redis
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`🗑️  Deleted ${keys.length} Redis cache entries matching: ${pattern}`);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Redis pattern delete error: ${pattern}`);
  }

  // Delete from memory cache
  const memoryKeys = Array.from(memoryCache.keys()).filter((k) => {
    const regexPattern = pattern.replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`).test(k);
  });

  memoryKeys.forEach((k) => memoryCache.delete(k));
  if (memoryKeys.length > 0) {
    console.log(`🗑️  Deleted ${memoryKeys.length} memory cache entries matching: ${pattern}`);
  }
}

export function getCacheKey(prefix: string, id: string): string {
  return `${prefix}:${id}`;
}

// Predefined cache keys
export const CACHE_KEYS = {
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCT_LIST: (sortBy: string) => `products:list:${sortBy}`,
  USER: (email: string) => `user:${email}`,
  USER_CART: (email: string) => `cart:${email}`,
  USER_WISHLIST: (email: string) => `wishlist:${email}`,
  USER_ADDRESSES: (email: string) => `addresses:${email}`,
  ORDER: (orderId: string) => `order:${orderId}`,
  USER_ORDERS: (email: string) => `orders:${email}`,
};
