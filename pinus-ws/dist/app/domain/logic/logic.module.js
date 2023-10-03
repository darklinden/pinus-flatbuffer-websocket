"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const consts_module_1 = require("../consts/consts.module");
const db_module_1 = require("../db/db.module");
const user_info_logic_service_1 = require("./user-info-logic/user-info-logic.service");
let LogicModule = class LogicModule {
};
LogicModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            // 数据库模块
            db_module_1.DbModule,
            // 文件配置模块
            consts_module_1.ConstsModule,
        ],
        providers: [
            user_info_logic_service_1.UserInfoLogicService,
        ],
        exports: [
            user_info_logic_service_1.UserInfoLogicService,
        ],
    })
], LogicModule);
exports.LogicModule = LogicModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naWMubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9sb2dpYy9sb2dpYy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLDJDQUE4QztBQUM5QywyREFBdUQ7QUFDdkQsK0NBQTJDO0FBQzNDLHVGQUFpRjtBQW9CakYsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQUFJLENBQUE7QUFBZixXQUFXO0lBbEJ2QixJQUFBLGVBQU0sRUFBQztRQUNKLE9BQU8sRUFBRTtZQUNMLHFCQUFZO1lBRVosUUFBUTtZQUNSLG9CQUFRO1lBRVIsU0FBUztZQUNULDRCQUFZO1NBQ2Y7UUFDRCxTQUFTLEVBQUU7WUFDUCw4Q0FBb0I7U0FDdkI7UUFDRCxPQUFPLEVBQUU7WUFDTCw4Q0FBb0I7U0FDdkI7S0FDSixDQUFDO0dBRVcsV0FBVyxDQUFJO0FBQWYsa0NBQVcifQ==