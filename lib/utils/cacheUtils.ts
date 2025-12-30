import { createClient } from 'redis';
import systemConfig from '../../config/system';

export class CacheService {
  private client: any;
  private prefix: string;
  private connected: boolean = false;

  constructor() {
    this.prefix = systemConfig.redis.prefix || 'cbt:';
    this.connect();
  }

  private async connect() {
    try {
      this.client = createClient({
        url: systemConfig.redis.url,
        password: systemConfig.redis.password,
      });

      this.client.on('error', (err: Error) => {
        console.error('Redis error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
        this.connected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.connected = false;
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.connected) return null;
    
    try {
      return await this.client.get(this.prefix + key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      if (ttl) {
        await this.client.set(this.prefix + key, value, 'EX', ttl);
      } else {
        await this.client.set(this.prefix + key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      await this.client.del(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    if (!this.connected) return [];
    
    try {
      const keys = await this.client.keys(this.prefix + pattern);
      return keys.map((key: string) => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  }

  public async flush(): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      await this.client.flushDB();
      return true;
    } catch (error) {
      console.error('Redis flush error:', error);
      return false;
    }
  }

  public async getTTL(key: string): Promise<number> {
    if (!this.connected) return -2;
    
    try {
      return await this.client.ttl(this.prefix + key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -2;
    }
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      const result = await this.client.exists(this.prefix + key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  public async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.connected) return 0;
    
    try {
      return await this.client.incrBy(this.prefix + key, amount);
    } catch (error) {
      console.error('Redis increment error:', error);
      return 0;
    }
  }

  public async decrement(key: string, amount: number = 1): Promise<number> {
    if (!this.connected) return 0;
    
    try {
      return await this.client.decrBy(this.prefix + key, amount);
    } catch (error) {
      console.error('Redis decrement error:', error);
      return 0;
    }
  }

  public async getHash(key: string): Promise<Record<string, string>> {
    if (!this.connected) return {};
    
    try {
      return await this.client.hGetAll(this.prefix + key);
    } catch (error) {
      console.error('Redis hgetall error:', error);
      return {};
    }
  }

  public async setHash(key: string, data: Record<string, string>): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      await this.client.hSet(this.prefix + key, data);
      return true;
    } catch (error) {
      console.error('Redis hset error:', error);
      return false;
    }
  }

  public async getHashField(key: string, field: string): Promise<string | null> {
    if (!this.connected) return null;
    
    try {
      return await this.client.hGet(this.prefix + key, field);
    } catch (error) {
      console.error('Redis hget error:', error);
      return null;
    }
  }

  public async setHashField(key: string, field: string, value: string): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      await this.client.hSet(this.prefix + key, field, value);
      return true;
    } catch (error) {
      console.error('Redis hset field error:', error);
      return false;
    }
  }

  public async delHashField(key: string, field: string): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      await this.client.hDel(this.prefix + key, field);
      return true;
    } catch (error) {
      console.error('Redis hdel error:', error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connected && this.client) {
      try {
        await this.client.quit();
        this.connected = false;
      } catch (error) {
        console.error('Redis disconnect error:', error);
      }
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance
let cacheService: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheService) {
    cacheService = new CacheService();
  }
  return cacheService;
}

export async function cacheWithTTL(key: string, fn: () => Promise<any>, ttl: number = 3600): Promise<any> {
  const cache = getCacheService();
  
  if (!cache.isConnected()) {
    return await fn();
  }
  
  const cachedValue = await cache.get(key);
  
  if (cachedValue) {
    try {
      return JSON.parse(cachedValue);
    } catch (error) {
      console.error('Failed to parse cached value:', error);
    }
  }
  
  const result = await fn();
  
  try {
    await cache.set(key, JSON.stringify(result), ttl);
  } catch (error) {
    console.error('Failed to cache result:', error);
  }
  
  return result;
}

export async function invalidateCache(key: string): Promise<boolean> {
  const cache = getCacheService();
  return await cache.del(key);
}

export async function clearCache(): Promise<boolean> {
  const cache = getCacheService();
  return await cache.flush();
}