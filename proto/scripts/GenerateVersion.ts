import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CsvAll } from './Initialize';
import { paths } from './Paths';
import { git_branch, git_last_commit, git_last_commit_time } from '../tools/BuildTool';

export async function generateVersion(csv_all: CsvAll) {

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

    const bytes_md5 = md5.digest("hex");
    console.log('bytes md5: ', bytes_md5);

    const branch = git_branch(paths.bytes);
    const commit = git_last_commit(paths.bytes);
    const time = git_last_commit_time(paths.bytes);

    const version_info = JSON.stringify({
        md5: bytes_md5,
        branch,
        commit,
        time,
    });

    await fs.writeFile(path.join(paths.bytes, 'ver.json'), version_info, 'utf8');
}