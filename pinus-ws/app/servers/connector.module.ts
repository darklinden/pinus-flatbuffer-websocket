import { Module } from '@nestjs/common';
import { TellerModule } from '../domain/teller/teller.module';
import { pinusAppProvider } from '../utils/nestutil';
import { EntryHandler } from './connector/handler/entryHandler';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
        TellerModule,
    ],
    controllers: [],
    providers: [
        pinusAppProvider,
        EntryHandler,
    ],
    exports: [
        EntryHandler,
    ],
})
export class ConnectorServerModule { }