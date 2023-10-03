import { Module } from '@nestjs/common';
import { MapXDataService } from './byte-config-serivces/mapXData.service';
import { ConstsVersionService } from './constsVersion.services';

@Module({
  providers: [
    ConstsVersionService,
    MapXDataService,
  ],
  exports: [
    ConstsVersionService,
    MapXDataService,
  ],
})
export class ConstsModule { }
