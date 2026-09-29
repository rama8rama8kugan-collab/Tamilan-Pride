import { createClient } from 'redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

class RedisService {
  private client: ReturnType<typeof createClient> | null = null;
  private connected = false;

  async connect() {
    try {
      this.client = createClient({ url: env.REDIS_URL });
      await this.client.connect();
      this.connected = true;
      logger.info('Redis connected');
    } catch (error) {
      logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connected && this.client) {
      await this.client.disconnect();
      this.connected = false;
      logger.info('Redis disconnected');
    }
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
      return;
    }

    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return (await this.client.exists(key)) === 1;
  }
}

export const redisService = new RedisService();
