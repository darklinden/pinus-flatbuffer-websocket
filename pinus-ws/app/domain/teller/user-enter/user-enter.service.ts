import { Injectable } from '@nestjs/common';
import { Application, FrontendSession } from 'pinus';
import { AuthService } from '../../auth/auth.service';
import * as flatbuffers from 'flatbuffers';
import { proto } from 'route';
import { UserInfoLogicService } from '../../logic/user-info-logic/user-info-logic.service';

import { getLogger } from 'pinus-logger';
import * as path from 'path';
let logger = getLogger('pinus', path.basename(__filename));

@Injectable()
export class UserEnterService {
    constructor(
        private readonly authService: AuthService,
        private readonly userInfoLogicService: UserInfoLogicService,
    ) { }

    // 单线程理论上不需要builder池
    // 会使用同一段byte数组，pos和length会被覆盖
    // 出现并发问题再使用builder池
    private responseBuilder = new flatbuffers.Builder(16);
    private buildResponse(code: proto.IServerErrorType, user: proto.IUserInfoT): Uint8Array {

        logger.log('buildResponse', code, JSON.stringify(user));

        this.responseBuilder.clear();

        let userOffset = 0;
        if (user) {

            let nameOffset = 0;
            if (user.name) nameOffset = this.responseBuilder.createString(user.name);

            userOffset = proto.UserInfo.create(this.responseBuilder, nameOffset, user.level);
        }

        proto.ResponseUserEnter.startResponseUserEnter(this.responseBuilder);
        proto.ResponseUserEnter.addCode(this.responseBuilder, code);
        proto.ResponseUserEnter.addUser(this.responseBuilder, userOffset);
        let resp = proto.ResponseUserEnter.end(this.responseBuilder);
        this.responseBuilder.finish(resp);

        return this.responseBuilder.asUint8Array();
    }

    public async enter(app: Application, msg: any, session: FrontendSession): Promise<Uint8Array> {

        const req = msg as proto.IRequestUserEnter;

        logger.log('enter', JSON.stringify(req.unpack()));

        let token = req.token();

        // 从登录参数中获取玩家id
        if (!token) {
            return this.buildResponse(proto.ServerErrorType.ERR_FAILED, null);
        }

        const verifiedToken = await this.authService.verifyAndDecode(token);
        logger.log('verifiedToken', JSON.stringify(verifiedToken));
        const uid = verifiedToken?.uid ? BigInt(verifiedToken.uid) : null;
        if (!uid) {
            return this.buildResponse(proto.ServerErrorType.ERR_FAILED, null);
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

        session.on('closed', async (sess: FrontendSession, reason: string) => {
            // 从channel中移除
            channel.leave(sess.uid, null);
            sess.unbind(sess.uid, null);
            logger.warn('session count:', Object.keys(sessionService.sessions).length);
        });

        // get user info from db
        let userInfoT = await this.userInfoLogicService.enter(verifiedToken);

        return this.buildResponse(proto.ServerErrorType.ERR_SUCCESS, userInfoT);
    }
}
