import { Redis } from '@upstash/redis';

// Simple singleton wrapper for Redis client to avoid hot-reload issues in dev
const getRedisClient = () => {
    // Only initialize if the URL and Token are present
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
        return null; // Silent fail if connection error occurs
    }
};

export const redis = getRedisClient();
