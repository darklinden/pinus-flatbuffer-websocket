import { promises as fs } from 'fs';
import * as path from 'path';
import * as flatbuffers from 'flatbuffers';
import { proto } from 'route';
import { Injectable } from '@nestjs/common';

import { getLogger } from 'pinus-logger';
let logger = getLogger('pinus', path.basename(__filename));

@Injectable()
export class MapXDataService {

    constructor() {
        this.init();
    }

    private data: { [key: number]: proto.IMapXDataRowT } = null;

    async init(): Promise<void> {

        let config_path = path.join(__dirname, '..', '..', '..', '..', 'config');;

        const file = path.join(config_path, 'bytes', 'Map', 'MapXData.bytes');
        logger.log(`${this.constructor.name} loading config ${file} ...`);

        const buff = await fs.readFile(file, 'binary')
        let original = Buffer.from(buff, 'binary');
        let buffer = new flatbuffers.ByteBuffer(original);
        const args = proto.MapXData.getRoot(buffer);
        const table = args.unpack();

        const dict: { [key: number]: proto.IMapXDataRowT } = {};

        for (let i = 0; i < table.rows.length; i++) {
            var row = table.rows[i];
            dict[row.id] = row;
        }

        this.data = dict;
    }

    exit(): void {
        this.data = null;
    }

    public get(id: number): proto.IMapXDataRowT {
        if (!this.data) return null;
        return this.data[id];
    }
}
