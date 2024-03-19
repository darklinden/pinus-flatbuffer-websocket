import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CsvAll } from './Initialize';
import { paths } from './Paths';

export async function generateVersion(csv_all: CsvAll, version_path: string) {

    const md5 = crypto.createHash('md5')

    const bytes = [];

    for (const key in csv_all.tables) {
        const table = csv_all.tables[key];
        for (const data_relative_path of table.data_relative_paths) {
            let bytes_path = path.join(paths.bytes, data_relative_path + '.bytes');
            bytes.push(bytes_path);
        }
    }

    bytes.sort();

    for (const bytes_path of bytes) {
        const contents = await fs.readFile(bytes_path, 'binary');
        md5.update(contents);
    }

    const version = md5.digest("hex");
    console.log('version: ', version);
    await fs.writeFile(version_path, version, 'utf8');
}