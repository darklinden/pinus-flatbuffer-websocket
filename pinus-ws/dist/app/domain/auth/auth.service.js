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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const napi_jwt_1 = require("napi-jwt");
const pinus_logger_1 = require("pinus-logger");
const path = require("path");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
let AuthService = class AuthService {
    constructor(configService) {
        this.configService = configService;
        this.m_expireTime = -1;
    }
    get expireTime() {
        if (this.m_expireTime < 0) {
            this.m_expireTime = this.configService.get('JWT_EXPIRATION_TIME');
        }
        return this.m_expireTime;
    }
    async createToken(uid) {
        try {
            const payload = {
                uid: '' + uid,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + this.expireTime,
            };
            const token = (0, napi_jwt_1.sign)(JSON.stringify(payload));
            return token;
        }
        catch (error) {
            logger.error(error);
        }
        return null;
    }
    async verifyAndDecode(token) {
        try {
            const payload = (0, napi_jwt_1.verify)(token);
            if (!payload || !payload.length)
                return null;
            return JSON.parse(payload);
        }
        catch (error) {
            logger.error(error);
        }
        return null;
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9hdXRoL2F1dGguc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBNEM7QUFDNUMsMkNBQStDO0FBRS9DLHVDQUF3QztBQUV4QywrQ0FBeUM7QUFDekMsNkJBQTZCO0FBQzdCLElBQUksTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBRzNELElBQWEsV0FBVyxHQUF4QixNQUFhLFdBQVc7SUFDcEIsWUFDcUIsYUFBNEI7UUFBNUIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFHekMsaUJBQVksR0FBVyxDQUFDLENBQUMsQ0FBQztJQUY5QixDQUFDO0lBR0wsSUFBSSxVQUFVO1FBQ1YsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFTLHFCQUFxQixDQUFDLENBQUM7U0FDN0U7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBVztRQUN6QixJQUFJO1lBQ0EsTUFBTSxPQUFPLEdBQVk7Z0JBQ3JCLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRztnQkFDYixHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO2dCQUNsQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVU7YUFDdkQsQ0FBQztZQUNGLE1BQU0sS0FBSyxHQUFHLElBQUEsZUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM1QyxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQWE7UUFDL0IsSUFBSTtZQUNBLE1BQU0sT0FBTyxHQUFHLElBQUEsaUJBQU0sRUFBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDN0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBWSxDQUFDO1NBQ3pDO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKLENBQUE7QUF0Q1ksV0FBVztJQUR2QixJQUFBLG1CQUFVLEdBQUU7cUNBRzJCLHNCQUFhO0dBRnhDLFdBQVcsQ0FzQ3ZCO0FBdENZLGtDQUFXIn0=