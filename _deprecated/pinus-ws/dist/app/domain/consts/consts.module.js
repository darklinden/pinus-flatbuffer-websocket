"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstsModule = void 0;
const common_1 = require("@nestjs/common");
const mapXData_service_1 = require("./byte-config-serivces/mapXData.service");
const constsVersion_services_1 = require("./constsVersion.services");
let ConstsModule = class ConstsModule {
};
ConstsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            constsVersion_services_1.ConstsVersionService,
            mapXData_service_1.MapXDataService,
        ],
        exports: [
            constsVersion_services_1.ConstsVersionService,
            mapXData_service_1.MapXDataService,
        ],
    })
], ConstsModule);
exports.ConstsModule = ConstsModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vY29uc3RzL2NvbnN0cy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLDhFQUEwRTtBQUMxRSxxRUFBZ0U7QUFZaEUsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtDQUFJLENBQUE7QUFBaEIsWUFBWTtJQVZ4QixJQUFBLGVBQU0sRUFBQztRQUNOLFNBQVMsRUFBRTtZQUNULDZDQUFvQjtZQUNwQixrQ0FBZTtTQUNoQjtRQUNELE9BQU8sRUFBRTtZQUNQLDZDQUFvQjtZQUNwQixrQ0FBZTtTQUNoQjtLQUNGLENBQUM7R0FDVyxZQUFZLENBQUk7QUFBaEIsb0NBQVkifQ==