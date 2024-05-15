"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfoDbModule = void 0;
const common_1 = require("@nestjs/common");
const redis_module_1 = require("../../redis/redis.module");
const user_info_db_service_1 = require("./user-info-db.service");
const prisma_module_1 = require("../../prisma/prisma.module");
let UserInfoDbModule = class UserInfoDbModule {
};
UserInfoDbModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
        ],
        providers: [
            user_info_db_service_1.UserInfoDbService,
        ],
        exports: [
            user_info_db_service_1.UserInfoDbService,
        ],
    })
], UserInfoDbModule);
exports.UserInfoDbModule = UserInfoDbModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1pbmZvLWRiLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9kb21haW4vZGIvZGItc2VydmljZXMvdXNlci1pbmZvLWRiL3VzZXItaW5mby1kYi5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLDJEQUF1RDtBQUN2RCxpRUFBMkQ7QUFDM0QsOERBQTBEO0FBYzFELElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0NBQUksQ0FBQTtBQUFwQixnQkFBZ0I7SUFaNUIsSUFBQSxlQUFNLEVBQUM7UUFDTixPQUFPLEVBQUU7WUFDUCw0QkFBWTtZQUNaLDBCQUFXO1NBQ1o7UUFDRCxTQUFTLEVBQUU7WUFDVCx3Q0FBaUI7U0FDbEI7UUFDRCxPQUFPLEVBQUU7WUFDUCx3Q0FBaUI7U0FDbEI7S0FDRixDQUFDO0dBQ1csZ0JBQWdCLENBQUk7QUFBcEIsNENBQWdCIn0=