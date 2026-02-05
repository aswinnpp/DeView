import NodeCache from 'node-cache';

class SessionCache {
    private cache: NodeCache;

    constructor() {
        this.cache = new NodeCache({
            stdTTL: 60,
            checkperiod: 120,
            useClones: false,
        });
    }

    async setex(key: string, ttl: number, value: string): Promise<void> {
        this.cache.set(key, value, ttl);
    }

    async get(key: string): Promise<string | null> {
        const value = this.cache.get<string>(key);
        return value || null;
    }

    async del(key: string): Promise<void> {
        this.cache.del(key);
    }
}

export const sessionCache = new SessionCache();
