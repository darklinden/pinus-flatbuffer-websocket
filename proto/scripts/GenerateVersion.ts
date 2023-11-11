import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import { IGenerateBytesResult } from './GenerateBytes';


export async function generateVersion(bytes_path_list: IGenerateBytesResult[], version_path: string) {

    const md5 = crypto.createHash('md5')

    const bytes = [];

    for (const item of bytes_path_list) {
        let bytes_path = item.bytes_path;
        bytes_path = bytes_path.replace(/\.bin/g, '.bytes');
        bytes.push(bytes_path);
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