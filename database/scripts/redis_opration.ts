import { Redis } from "ioredis";

export async function redis_flush_all(): Promise<void> {
    console.log('');
    console.log('----------------------------------------');
    console.log('Start to flush redis.');
    console.log('----------------------------------------');
    console.log('');

    const now = Date.now();
    const redis = await new Redis(process.env.REDIS_URL);
    await redis.flushall();
    await redis.quit();
    const time = Date.now() - now;
    console.log('Redis flushed in ' + time + 'ms.');

    console.log('');
    console.log('----------------------------------------');
    console.log('redis flushed');
    console.log('----------------------------------------');
    console.log('');
}