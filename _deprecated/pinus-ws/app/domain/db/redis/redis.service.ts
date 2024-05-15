import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

import { getLogger } from 'pinus-logger';
import * as path from 'path';
let logger = getLogger('pinus', path.basename(__filename));

@Injectable()
export class RedisService {

    constructor(
        private readonly configService: ConfigService,
    ) { }

    public ex: 'EX' = 'EX'; // expire time
    public expireTime = 60 * 60 * 24 * 1; // 1 day

    private redis: Redis
    async getRedis() {
        if (!this.redis) {
            const url = this.configService.get<string>('REDIS_URL');
            this.redis = new Redis(url);
        }
        return this.redis;
    }

    private subscriber: Redis
    async getSubscriber() {
        if (!this.subscriber) {
            const url = this.configService.get<string>('REDIS_URL');
            this.redis = new Redis(url);
        }
        return this.subscriber;
    }

    async quit() {
        if (this.redis) {
            await this.redis.quit();
        }
        if (this.subscriber) {
            await this.subscriber.quit();
        }
    }

    async get(key: string): Promise<string> {
        const redis = await this.getRedis();
        return await redis.get(key);
    }

    async set(key: string, value: string): Promise<string> {
        const redis = await this.getRedis();
        return await redis.set(key, value, this.ex, this.expireTime);
    }

    async del(key: string): Promise<number> {
        const redis = await this.getRedis();
        return await redis.del(key);
    }
}

