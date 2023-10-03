import { Module } from '@nestjs/common';
import { UserInfoDbModule } from './db-services/user-info-db/user-info-db.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
    imports: [
        PrismaModule,
        RedisModule,
        UserInfoDbModule,
    ],
    providers: [

    ],
    exports: [
        PrismaModule,
        RedisModule,
        UserInfoDbModule,
    ],
})

export class DbModule { }