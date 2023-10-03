"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const config_1 = require("@nestjs/config");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule, // 导入 ConfigModule
        ],
        providers: [auth_service_1.AuthService],
        exports: [auth_service_1.AuthService] // 导出 AuthServie 供 UserModule 使用
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvZG9tYWluL2F1dGgvYXV0aC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLGlEQUE2QztBQUM3QywyQ0FBOEM7QUFTOUMsSUFBYSxVQUFVLEdBQXZCLE1BQWEsVUFBVTtDQUFJLENBQUE7QUFBZCxVQUFVO0lBUHRCLElBQUEsZUFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFO1lBQ0wscUJBQVksRUFBRyxrQkFBa0I7U0FDcEM7UUFDRCxTQUFTLEVBQUUsQ0FBQywwQkFBVyxDQUFDO1FBQ3hCLE9BQU8sRUFBRSxDQUFDLDBCQUFXLENBQUMsQ0FBRSxnQ0FBZ0M7S0FDM0QsQ0FBQztHQUNXLFVBQVUsQ0FBSTtBQUFkLGdDQUFVIn0=