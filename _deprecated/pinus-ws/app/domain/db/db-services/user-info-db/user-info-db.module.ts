import { Module } from '@nestjs/common';
import { RedisModule } from '../../redis/redis.module';
import { UserInfoDbService } from './user-info-db.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
  ],
  providers: [
    UserInfoDbService,
  ],
  exports: [
    UserInfoDbService,
  ],
})
export class UserInfoDbModule { }
