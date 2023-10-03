"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbModule = void 0;
const common_1 = require("@nestjs/common");
const user_info_db_module_1 = require("./db-services/user-info-db/user-info-db.module");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
let DbModule = class DbModule {
};
DbModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            user_info_db_module_1.UserInfoDbModule,
        ],
        providers: [],
        exports: [
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            user_info_db_module_1.UserInfoDbModule,
        ],
    })
], DbModule);
exports.DbModule = DbModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9kYi9kYi5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLHdGQUFrRjtBQUNsRiwwREFBc0Q7QUFDdEQsdURBQW1EO0FBa0JuRCxJQUFhLFFBQVEsR0FBckIsTUFBYSxRQUFRO0NBQUksQ0FBQTtBQUFaLFFBQVE7SUFoQnBCLElBQUEsZUFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFO1lBQ0wsNEJBQVk7WUFDWiwwQkFBVztZQUNYLHNDQUFnQjtTQUNuQjtRQUNELFNBQVMsRUFBRSxFQUVWO1FBQ0QsT0FBTyxFQUFFO1lBQ0wsNEJBQVk7WUFDWiwwQkFBVztZQUNYLHNDQUFnQjtTQUNuQjtLQUNKLENBQUM7R0FFVyxRQUFRLENBQUk7QUFBWiw0QkFBUSJ9