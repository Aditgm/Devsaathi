import { Redis } from '@upstash/redis';

// Singleton Redis client — avoids re-creating connections on hot reload
const getRedisClient = () => {

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return null;
    }

    try {
        return new Redis({
            url,
            token,
        });
    } catch (e) {
        console.warn("Failed to initialize Upstash Redis:", e);
        return null;
    }
};

export const redis = getRedisClient();
