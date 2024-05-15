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
exports.UserInfoLogicService = void 0;
const common_1 = require("@nestjs/common");
const constsVersion_services_1 = require("../../consts/constsVersion.services");
const user_info_dto_1 = require("../../db/structs/dto/user-info.dto");
const user_info_db_service_1 = require("../../db/db-services/user-info-db/user-info-db.service");
const pinus_logger_1 = require("pinus-logger");
const path = require("path");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
let UserInfoLogicService = class UserInfoLogicService {
    constructor(
    // config version
    constsVersionService, 
    // db services
    userInfoDbService) {
        this.constsVersionService = constsVersionService;
        this.userInfoDbService = userInfoDbService;
    }
    async enter(authData) {
        logger.log(`enter: ${JSON.stringify(authData)}`);
        const userId = BigInt(authData.uid);
        let constVer = await this.constsVersionService.get_data();
        // 从 cache 或 db 中获取玩家信息
        let user_config_version_changed = false;
        let dto = await this.userInfoDbService.get(userId);
        logger.log(`user_info: ${JSON.stringify(dto)}`);
        if (!dto) {
            dto = new user_info_dto_1.UserInfoDto();
            dto.id = userId;
            dto.name = '';
            dto.level = 1;
            dto.last_login_version = constVer;
            user_config_version_changed = true;
        }
        // 如果配置版本号不一致，通知其他逻辑处理玩家信息
        if (dto.last_login_version != constVer) {
            dto.last_login_version = constVer;
            // TODO: 处理玩家信息
            user_config_version_changed = true;
        }
        if (user_config_version_changed)
            dto = await this.userInfoDbService.save(dto);
        let userInfoT = {
            name: dto.name,
            level: dto.level,
        };
        return userInfoT;
    }
};
UserInfoLogicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [constsVersion_services_1.ConstsVersionService,
        user_info_db_service_1.UserInfoDbService])
], UserInfoLogicService);
exports.UserInfoLogicService = UserInfoLogicService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1pbmZvLWxvZ2ljLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvZG9tYWluL2xvZ2ljL3VzZXItaW5mby1sb2dpYy91c2VyLWluZm8tbG9naWMuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBb0Q7QUFFcEQsZ0ZBQTJFO0FBQzNFLHNFQUFxRjtBQUVyRixpR0FBMkY7QUFFM0YsK0NBQXlDO0FBQ3pDLDZCQUE2QjtBQUM3QixJQUFJLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUczRCxJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtJQUU3QjtJQUVJLGlCQUFpQjtJQUNBLG9CQUEwQztJQUUzRCxjQUFjO0lBQ0csaUJBQW9DO1FBSHBDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFHMUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtJQUVyRCxDQUFDO0lBRUwsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFpQjtRQUV6QixNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVwQyxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUUxRCx1QkFBdUI7UUFDdkIsSUFBSSwyQkFBMkIsR0FBRyxLQUFLLENBQUM7UUFDeEMsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRW5ELE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sR0FBRyxHQUFHLElBQUksMkJBQVcsRUFBRSxDQUFDO1lBQ3hCLEdBQUcsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2QsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxHQUFHLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLDJCQUEyQixHQUFHLElBQUksQ0FBQztTQUN0QztRQUVELDBCQUEwQjtRQUMxQixJQUFJLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxRQUFRLEVBQUU7WUFFcEMsR0FBRyxDQUFDLGtCQUFrQixHQUFHLFFBQVEsQ0FBQztZQUVsQyxlQUFlO1lBRWYsMkJBQTJCLEdBQUcsSUFBSSxDQUFDO1NBQ3RDO1FBRUQsSUFBSSwyQkFBMkI7WUFDM0IsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVqRCxJQUFJLFNBQVMsR0FBcUI7WUFDOUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1lBQ2QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO1NBQ25CLENBQUM7UUFFRixPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0NBQ0osQ0FBQTtBQXZEWSxvQkFBb0I7SUFEaEMsSUFBQSxtQkFBVSxHQUFFO3FDQU1rQyw2Q0FBb0I7UUFHdkIsd0NBQWlCO0dBUmhELG9CQUFvQixDQXVEaEM7QUF2RFksb0RBQW9CIn0=