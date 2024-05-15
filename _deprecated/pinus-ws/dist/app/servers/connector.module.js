"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorServerModule = void 0;
const common_1 = require("@nestjs/common");
const teller_module_1 = require("../domain/teller/teller.module");
const nestutil_1 = require("../utils/nestutil");
const entryHandler_1 = require("./connector/handler/entryHandler");
const config_1 = require("@nestjs/config");
let ConnectorServerModule = class ConnectorServerModule {
};
ConnectorServerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: '.env',
            }),
            teller_module_1.TellerModule,
        ],
        controllers: [],
        providers: [
            nestutil_1.pinusAppProvider,
            entryHandler_1.EntryHandler,
        ],
        exports: [
            entryHandler_1.EntryHandler,
        ],
    })
], ConnectorServerModule);
exports.ConnectorServerModule = ConnectorServerModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdG9yLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2Nvbm5lY3Rvci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLGtFQUE4RDtBQUM5RCxnREFBcUQ7QUFDckQsbUVBQWdFO0FBQ2hFLDJDQUE4QztBQWtCOUMsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7Q0FBSSxDQUFBO0FBQXpCLHFCQUFxQjtJQWhCakMsSUFBQSxlQUFNLEVBQUM7UUFDSixPQUFPLEVBQUU7WUFDTCxxQkFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDakIsV0FBVyxFQUFFLE1BQU07YUFDdEIsQ0FBQztZQUNGLDRCQUFZO1NBQ2Y7UUFDRCxXQUFXLEVBQUUsRUFBRTtRQUNmLFNBQVMsRUFBRTtZQUNQLDJCQUFnQjtZQUNoQiwyQkFBWTtTQUNmO1FBQ0QsT0FBTyxFQUFFO1lBQ0wsMkJBQVk7U0FDZjtLQUNKLENBQUM7R0FDVyxxQkFBcUIsQ0FBSTtBQUF6QixzREFBcUIifQ==