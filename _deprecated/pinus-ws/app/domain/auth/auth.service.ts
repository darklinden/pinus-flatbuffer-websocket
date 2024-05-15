import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import { sign, verify } from 'napi-jwt';

import { getLogger } from 'pinus-logger';
import * as path from 'path';
let logger = getLogger('pinus', path.basename(__filename));

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    private m_expireTime: number = -1;
    get expireTime(): number {
        if (this.m_expireTime < 0) {
            this.m_expireTime = this.configService.get<number>('JWT_EXPIRATION_TIME');
        }
        return this.m_expireTime;
    }

    async createToken(uid: bigint): Promise<string> {
        try {
            const payload: AuthDto = {
                uid: '' + uid,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + this.expireTime,
            };
            const token = sign(JSON.stringify(payload));
            return token;
        } catch (error) {
            logger.error(error);
        }
        return null;
    }

    async verifyAndDecode(token: string): Promise<AuthDto | null> {
        try {
            const payload = verify(token);
            if (!payload || !payload.length) return null;
            return JSON.parse(payload) as AuthDto;
        } catch (error) {
            logger.error(error);
        }
        return null;
    }
}