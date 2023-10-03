"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("./redis.service");
let RedisModule = class RedisModule {
};
RedisModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [],
        providers: [
            redis_service_1.RedisService,
        ],
        exports: [
            redis_service_1.RedisService,
        ]
    })
], RedisModule);
exports.RedisModule = RedisModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXMubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9kYi9yZWRpcy9yZWRpcy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLDJDQUE4QztBQUM5QyxtREFBK0M7QUFZL0MsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztDQUFJLENBQUE7QUFBZixXQUFXO0lBVnZCLElBQUEsZUFBTSxFQUFDO1FBQ04sT0FBTyxFQUFFLENBQUMscUJBQVksQ0FBQztRQUN2QixXQUFXLEVBQUUsRUFBRTtRQUNmLFNBQVMsRUFBRTtZQUNULDRCQUFZO1NBQ2I7UUFDRCxPQUFPLEVBQUU7WUFDUCw0QkFBWTtTQUNiO0tBQ0YsQ0FBQztHQUNXLFdBQVcsQ0FBSTtBQUFmLGtDQUFXIn0=