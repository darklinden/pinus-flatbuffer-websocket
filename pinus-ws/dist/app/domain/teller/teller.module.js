"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TellerModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const logic_module_1 = require("../logic/logic.module");
const user_enter_service_1 = require("./user-enter/user-enter.service");
let TellerModule = class TellerModule {
};
TellerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            logic_module_1.LogicModule,
        ],
        providers: [
            user_enter_service_1.UserEnterService,
        ],
        exports: [
            user_enter_service_1.UserEnterService,
        ],
    })
], TellerModule);
exports.TellerModule = TellerModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsbGVyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vdGVsbGVyL3RlbGxlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLHFEQUFpRDtBQUNqRCx3REFBb0Q7QUFDcEQsd0VBQW1FO0FBY25FLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7Q0FBSSxDQUFBO0FBQWhCLFlBQVk7SUFaeEIsSUFBQSxlQUFNLEVBQUM7UUFDSixPQUFPLEVBQUU7WUFDTCx3QkFBVTtZQUNWLDBCQUFXO1NBQ2Q7UUFDRCxTQUFTLEVBQUU7WUFDUCxxQ0FBZ0I7U0FDbkI7UUFDRCxPQUFPLEVBQUU7WUFDTCxxQ0FBZ0I7U0FDbkI7S0FDSixDQUFDO0dBQ1csWUFBWSxDQUFJO0FBQWhCLG9DQUFZIn0=