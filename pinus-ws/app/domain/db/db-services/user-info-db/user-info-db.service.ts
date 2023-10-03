import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { UserInfoDto, UserInfoDtoFactory } from '../../structs/dto/user-info.dto';
import { PrismaService } from '../../prisma/prisma.service';

import { getLogger } from 'pinus-logger';
import * as path from 'path';
let logger = getLogger('pinus', path.basename(__filename));

@Injectable()
export class UserInfoDbService {

    constructor(
        private prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    async get(uid: bigint): Promise<UserInfoDto> {
        // return cache if exists
        let dto: UserInfoDto = await this.getCache(uid);
        if (dto) return dto;

        // return db if exists
        let ent = await this.prisma.user_info.findUnique({ where: { id: uid } });
        if (ent) {
            dto = UserInfoDtoFactory.toDto(ent, dto);
            // save to cache
            await this.saveCache(dto);
        }
        return dto;
    }

    async save(dto: UserInfoDto): Promise<UserInfoDto> {
        const result = await this.prisma.user_info.upsert({
            where: { id: dto.id },
            create: dto,
            update: dto,
        });

        logger.log('UserInfoDbService.save', result);
        if (result) {
            dto = UserInfoDtoFactory.toDto(result, dto);
            await this.saveCache(dto);
        }
        else {
            logger.error('UserInfoDbService.save failed');
        }
        return dto;
    }

    async getCache(uid: bigint): Promise<UserInfoDto> {
        const hkey = UserInfoDto.name + ':' + uid;
        const dto_str = await this.redisService.get(hkey);
        if (dto_str) {
            return UserInfoDtoFactory.fromJSON(JSON.parse(dto_str));
        }
        return null;
    }

    async saveCache(dto: UserInfoDto): Promise<void> {
        const hkey = UserInfoDto.name + ':' + dto.id;
        await this.redisService.set(hkey, JSON.stringify(dto));
    }

    async delCache(uid: bigint): Promise<void> {
        const hkey = UserInfoDto.name + ':' + uid;
        await this.redisService.del(hkey);
    }
}
