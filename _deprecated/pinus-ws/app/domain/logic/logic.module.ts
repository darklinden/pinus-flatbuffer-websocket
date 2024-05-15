import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConstsModule } from '../consts/consts.module';
import { DbModule } from '../db/db.module';
import { UserInfoLogicService } from './user-info-logic/user-info-logic.service';

@Module({
    imports: [
        ConfigModule,

        // 数据库模块
        DbModule,

        // 文件配置模块
        ConstsModule,
    ],
    providers: [
        UserInfoLogicService,
    ],
    exports: [
        UserInfoLogicService,
    ],
})

export class LogicModule { }
