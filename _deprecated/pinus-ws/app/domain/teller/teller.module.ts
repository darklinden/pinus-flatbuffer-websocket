import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LogicModule } from '../logic/logic.module';
import { UserEnterService } from './user-enter/user-enter.service';

@Module({
    imports: [
        AuthModule,
        LogicModule,
    ],
    providers: [
        UserEnterService,
    ],
    exports: [
        UserEnterService,
    ],
})
export class TellerModule { }
