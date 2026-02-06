import Redis from 'ioredis';

class RedisClient {
    private client: Redis | null = null;
    private isConnected: boolean = false;

    async connect(): Promise<Redis> {
        if (this.client && this.isConnected) {
            return this.client;
        }

        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        this.client = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });

        this.client.on('connect', () => {
            console.log('✅ Connected to Redis');
            this.isConnected = true;
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis connection error:', err.message);
            this.isConnected = false;
        });

        this.client.on('close', () => {
            console.log('🔌 Redis connection closed');
            this.isConnected = false;
        });

        await this.client.connect();
        return this.client;
    }

    getClient(): Redis {
        if (!this.client) {
            throw new Error('Redis client not initialized. Call connect() first.');
        }
        return this.client;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
        }
    }

    isReady(): boolean {
        return this.isConnected && this.client !== null;
    }


    async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
        const client = this.getClient();
        await client.setex(key, ttlSeconds, value);
    }

    async get(key: string): Promise<string | null> {
        const client = this.getClient();
        return await client.get(key);
    }

    async del(key: string): Promise<void> {
        const client = this.getClient();
        await client.del(key);
    }

    async keys(pattern: string): Promise<string[]> {
        const client = this.getClient();
        return await client.keys(pattern);
    }

    async exists(key: string): Promise<boolean> {
        const client = this.getClient();
        const result = await client.exists(key);
        return result === 1;
    }

    async ttl(key: string): Promise<number> {
        const client = this.getClient();
        return await client.ttl(key);
    }
}

export const redisClient = new RedisClient();
