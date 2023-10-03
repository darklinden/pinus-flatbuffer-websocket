"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
};
PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
exports.PrismaService = PrismaService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpc21hLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvZG9tYWluL2RiL3ByaXNtYS9wcmlzbWEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBMEQ7QUFDMUQsMkNBQThDO0FBRzlDLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWMsU0FBUSxxQkFBWTtJQUMzQyxLQUFLLENBQUMsWUFBWTtRQUNkLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzFCLENBQUM7Q0FDSixDQUFBO0FBSlksYUFBYTtJQUR6QixJQUFBLG1CQUFVLEdBQUU7R0FDQSxhQUFhLENBSXpCO0FBSlksc0NBQWEifQ==