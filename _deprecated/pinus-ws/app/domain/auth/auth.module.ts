import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,  // 导入 ConfigModule
    ],
    providers: [AuthService],
    exports: [AuthService]  // 导出 AuthServie 供 UserModule 使用
})
export class AuthModule { }