const Redis = require('ioredis');

// Create Redis client with fallback to in-memory if Redis not available
let redis = null;
let useMemoryFallback = false;
const memoryStore = new Map();

const createRedisClient = () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            lazyConnect: true
        });

        redis.on('error', (err) => {
            console.warn('Redis connection error, using memory fallback:', err.message);
            useMemoryFallback = true;
        });

        redis.on('connect', () => {
            console.log('📊 Redis connected for view counting');
            useMemoryFallback = false;
        });

        // Try to connect
        redis.connect().catch(() => {
            useMemoryFallback = true;
            console.log('📊 Redis not available, using in-memory view store');
        });

    } catch (error) {
        console.warn('Redis initialization failed, using memory fallback');
        useMemoryFallback = true;
    }
};

// Initialize on module load
createRedisClient();

// View service methods
const viewService = {
    // Increment view count (fast, non-blocking)
    async incrementView(articleId) {
        const key = `views:article:${articleId}`;

        if (useMemoryFallback) {
            const current = memoryStore.get(key) || 0;
            memoryStore.set(key, current + 1);
            return current + 1;
        }

        try {
            return await redis.incr(key);
        } catch (error) {
            // Fallback to memory
            const current = memoryStore.get(key) || 0;
            memoryStore.set(key, current + 1);
            return current + 1;
        }
    },

    // Get pending view count for an article
    async getPendingViews(articleId) {
        const key = `views:article:${articleId}`;

        if (useMemoryFallback) {
            return memoryStore.get(key) || 0;
        }

        try {
            const count = await redis.get(key);
            return parseInt(count) || 0;
        } catch (error) {
            return memoryStore.get(key) || 0;
        }
    },

    // Get all pending view keys
    async getAllPendingViewKeys() {
        if (useMemoryFallback) {
            return Array.from(memoryStore.keys()).filter(k => k.startsWith('views:article:'));
        }

        try {
            return await redis.keys('views:article:*');
        } catch (error) {
            return Array.from(memoryStore.keys()).filter(k => k.startsWith('views:article:'));
        }
    },

    // Get and delete (for sync)
    async getAndClearViews(articleId) {
        const key = `views:article:${articleId}`;

        if (useMemoryFallback) {
            const count = memoryStore.get(key) || 0;
            memoryStore.delete(key);
            return count;
        }

        try {
            const count = await redis.getdel(key);
            return parseInt(count) || 0;
        } catch (error) {
            const count = memoryStore.get(key) || 0;
            memoryStore.delete(key);
            return count;
        }
    },

    // Check if Redis is connected
    isConnected() {
        return !useMemoryFallback && redis && redis.status === 'ready';
    }
};

module.exports = viewService;
