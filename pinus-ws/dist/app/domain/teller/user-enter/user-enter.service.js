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
exports.UserEnterService = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../auth/auth.service");
const flatbuffers = require("flatbuffers");
const route_1 = require("route");
const user_info_logic_service_1 = require("../../logic/user-info-logic/user-info-logic.service");
const pinus_logger_1 = require("pinus-logger");
const path = require("path");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
let UserEnterService = class UserEnterService {
    constructor(authService, userInfoLogicService) {
        this.authService = authService;
        this.userInfoLogicService = userInfoLogicService;
        // 单线程理论上不需要builder池
        // 会使用同一段byte数组，pos和length会被覆盖
        // 出现并发问题再使用builder池
        this.responseBuilder = new flatbuffers.Builder(16);
    }
    buildResponse(code, user) {
        logger.log('buildResponse', code, JSON.stringify(user));
        this.responseBuilder.clear();
        let userOffset = 0;
        if (user) {
            let nameOffset = 0;
            if (user.name)
                nameOffset = this.responseBuilder.createString(user.name);
            userOffset = route_1.proto.UserInfo.create(this.responseBuilder, nameOffset, user.level);
        }
        route_1.proto.ResponseUserEnter.startResponseUserEnter(this.responseBuilder);
        route_1.proto.ResponseUserEnter.addCode(this.responseBuilder, code);
        route_1.proto.ResponseUserEnter.addUser(this.responseBuilder, userOffset);
        let resp = route_1.proto.ResponseUserEnter.end(this.responseBuilder);
        this.responseBuilder.finish(resp);
        return this.responseBuilder.asUint8Array();
    }
    async enter(app, msg, session) {
        const req = msg;
        logger.log('enter', JSON.stringify(req.unpack()));
        let token = req.token();
        // 从登录参数中获取玩家id
        if (!token) {
            return this.buildResponse(route_1.proto.ServerErrorType.ERR_FAILED, null);
        }
        const verifiedToken = await this.authService.verifyAndDecode(token);
        logger.log('verifiedToken', JSON.stringify(verifiedToken));
        const uid = verifiedToken?.uid ? BigInt(verifiedToken.uid) : null;
        if (!uid) {
            return this.buildResponse(route_1.proto.ServerErrorType.ERR_FAILED, null);
        }
        const suid = uid.toString();
        let sessionService = app.get('sessionService');
        // 判断是否重复登录
        const old_sessions = sessionService.getByUid(suid);
        if (old_sessions && old_sessions.length > 0) {
            const old_session = old_sessions[0];
            if (old_session.id == session.id
                && old_session.frontendId == session.frontendId
                && old_session.uid == session.uid) {
                // 如果是同一个session，不做处理
            }
            else {
                // 如果是不同的session，踢掉旧的session
                await sessionService.akick(suid);
            }
        }
        // 绑定session
        await session.abind(suid);
        logger.warn('session count:', Object.keys(sessionService.sessions).length);
        const channelService = app.get('channelService');
        const channel = channelService.getChannel('total', true);
        session.on('closed', async (sess, reason) => {
            // 从channel中移除
            channel.leave(sess.uid, null);
            sess.unbind(sess.uid, null);
            logger.warn('session count:', Object.keys(sessionService.sessions).length);
        });
        // get user info from db
        let userInfoT = await this.userInfoLogicService.enter(verifiedToken);
        return this.buildResponse(route_1.proto.ServerErrorType.ERR_SUCCESS, userInfoT);
    }
};
UserEnterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_info_logic_service_1.UserInfoLogicService])
], UserEnterService);
exports.UserEnterService = UserEnterService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1lbnRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi90ZWxsZXIvdXNlci1lbnRlci91c2VyLWVudGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTRDO0FBRTVDLDBEQUFzRDtBQUN0RCwyQ0FBMkM7QUFDM0MsaUNBQThCO0FBQzlCLGlHQUEyRjtBQUUzRiwrQ0FBeUM7QUFDekMsNkJBQTZCO0FBQzdCLElBQUksTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBRzNELElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0lBQ3pCLFlBQ3FCLFdBQXdCLEVBQ3hCLG9CQUEwQztRQUQxQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBRy9ELG9CQUFvQjtRQUNwQiw4QkFBOEI7UUFDOUIsb0JBQW9CO1FBQ1osb0JBQWUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFMbEQsQ0FBQztJQU1HLGFBQWEsQ0FBQyxJQUE0QixFQUFFLElBQXNCO1FBRXRFLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUU3QixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxJQUFJLEVBQUU7WUFFTixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDbkIsSUFBSSxJQUFJLENBQUMsSUFBSTtnQkFBRSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFB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