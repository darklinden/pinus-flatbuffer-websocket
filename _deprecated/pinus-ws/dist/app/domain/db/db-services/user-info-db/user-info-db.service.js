"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfoDbService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../redis/redis.service");
const user_info_dto_1 = require("../../structs/dto/user-info.dto");
const prisma_service_1 = require("../../prisma/prisma.service");
const pinus_logger_1 = require("pinus-logger");
const path = require("path");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
let UserInfoDbService = class UserInfoDbService {
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async get(uid) {
        // return cache if exists
        let dto = await this.getCache(uid);
        if (dto)
            return dto;
        // return db if exists
        let ent = await this.prisma.user_info.findUnique({ where: { id: uid } });
        if (ent) {
            dto = user_info_dto_1.UserInfoDtoFactory.toDto(ent, dto);
            // save to cache
            await this.saveCache(dto);
        }
        return dto;
    }
    async save(dto) {
        const result = await this.prisma.user_info.upsert({
            where: { id: dto.id },
            create: dto,
            update: dto,
        });
        logger.log('UserInfoDbService.save', result);
        if (result) {
            dto = user_info_dto_1.UserInfoDtoFactory.toDto(result, dto);
            await this.saveCache(dto);
        }
        else {
            logger.error('UserInfoDbService.save failed');
        }
        return dto;
    }
    async getCache(uid) {
        const hkey = user_info_dto_1.UserInfoDto.name + ':' + uid;
        const dto_str = await this.redisService.get(hkey);
        if (dto_str) {
            return user_info_dto_1.UserInfoDtoFactory.fromJSON(JSON.parse(dto_str));
        }
        return null;
    }
    async saveCache(dto) {
        const hkey = user_info_dto_1.UserInfoDto.name + ':' + dto.id;
        await this.redisService.set(hkey, JSON.stringify(dto));
    }
    async delCache(uid) {
        const hkey = user_info_dto_1.UserInfoDto.name + ':' + uid;
        await this.redisService.del(hkey);
    }
};
UserInfoDbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], UserInfoDbService);
exports.UserInfoDbService = UserInfoDbService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1pbmZvLWRiLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvZG9tYWluL2RiL2RiLXNlcnZpY2VzL3VzZXItaW5mby1kYi91c2VyLWluZm8tZGIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBNEM7QUFDNUMsNkRBQXlEO0FBQ3pELG1FQUFrRjtBQUNsRixnRUFBNEQ7QUFFNUQsK0NBQXlDO0FBQ3pDLDZCQUE2QjtBQUM3QixJQUFJLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUczRCxJQUFhLGlCQUFpQixHQUE5QixNQUFhLGlCQUFpQjtJQUUxQixZQUNZLE1BQXFCLEVBQ1osWUFBMEI7UUFEbkMsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUNaLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBQzNDLENBQUM7SUFFTCxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVc7UUFDakIseUJBQXlCO1FBQ3pCLElBQUksR0FBRyxHQUFnQixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEQsSUFBSSxHQUFHO1lBQUUsT0FBTyxHQUFHLENBQUM7UUFFcEIsc0JBQXNCO1FBQ3RCLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RSxJQUFJLEdBQUcsRUFBRTtZQUNMLEdBQUcsR0FBRyxrQ0FBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLGdCQUFnQjtZQUNoQixNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDN0I7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQWdCO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQzlDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFO1lBQ3JCLE1BQU0sRUFBRSxHQUFHO1lBQ1gsTUFBTSxFQUFFLEdBQUc7U0FDZCxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLElBQUksTUFBTSxFQUFFO1lBQ1IsR0FBRyxHQUFHLGtDQUFrQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzdCO2FBQ0k7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7U0FDakQ7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQVc7UUFDdEIsTUFBTSxJQUFJLEdBQUcsMkJBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUMxQyxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUksT0FBTyxFQUFFO1lBQ1QsT0FBTyxrQ0FBa0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzNEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBZ0I7UUFDNUIsTUFBTSxJQUFJLEdBQUcsMkJBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDN0MsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQVc7UUFDdEIsTUFBTSxJQUFJLEdBQUcsMkJBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUMxQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FDSixDQUFBO0FBMURZLGlCQUFpQjtJQUQ3QixJQUFBLG1CQUFVLEdBQUU7cUNBSVcsOEJBQWE7UUFDRSw0QkFBWTtHQUp0QyxpQkFBaUIsQ0EwRDdCO0FBMURZLDhDQUFpQiJ9