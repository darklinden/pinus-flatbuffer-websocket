import { Inject, Injectable } from '@nestjs/common';
import { proto } from 'route';
import { ConstsVersionService } from '../../consts/constsVersion.services';
import { UserInfoDto, UserInfoDtoFactory } from '../../db/structs/dto/user-info.dto';
import { AuthDto } from '../../auth/dto/auth.dto';
import { UserInfoDbService } from '../../db/db-services/user-info-db/user-info-db.service';

import { getLogger } from 'pinus-logger';
import * as path from 'path';
let logger = getLogger('pinus', path.basename(__filename));

@Injectable()
export class UserInfoLogicService {

    constructor(

        // config version
        private readonly constsVersionService: ConstsVersionService,

        // db services
        private readonly userInfoDbService: UserInfoDbService,

    ) { }

    async enter(authData: AuthDto): Promise<proto.IUserInfoT> {

        logger.log(`enter: ${JSON.stringify(authData)}`);

        const userId = BigInt(authData.uid);

        let constVer = await this.constsVersionService.get_data();

        // 从 cache 或 db 中获取玩家信息
        let user_config_version_changed = false;
        let dto = await this.userInfoDbService.get(userId);

        logger.log(`user_info: ${JSON.stringify(dto)}`);

        if (!dto) {
            dto = new UserInfoDto();
            dto.id = userId;
            dto.name = '';
            dto.level = 1;
            dto.last_login_version = constVer;
            user_config_version_changed = true;
        }

        // 如果配置版本号不一致，通知其他逻辑处理玩家信息
        if (dto.last_login_version != constVer) {

            dto.last_login_version = constVer;

            // TODO: 处理玩家信息

            user_config_version_changed = true;
        }

        if (user_config_version_changed)
            dto = await this.userInfoDbService.save(dto);

        let userInfoT: proto.IUserInfoT = {
            name: dto.name,
            level: dto.level,
        };

        return userInfoT;
    }
}
