import { promises as fs } from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

import { getLogger } from 'pinus-logger';
let logger = getLogger('pinus', path.basename(__filename));

@Injectable()
export class ConstsVersionService {

    async init(): Promise<void> {
        await this.get_data();
    }

    exit(): void {
        this.data = null;
    }

    private data: string = null;

    async get_data(): Promise<string> {

        if (this.data) {
            return this.data;
        }

        let config_path = path.join(__dirname, '..', '..', '..', 'config');

        const file = path.join(config_path, 'bytes', 'version.bytes');
        logger.log(`${this.constructor.name} loading config ${file} ...`);

        const text = await fs.readFile(file, 'utf8');
        this.data = text.trim();

        return this.data;
    }
}