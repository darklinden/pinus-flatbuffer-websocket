import * as path from 'path';
import { promises as fs } from 'fs';

import { generateBytes } from "./GenerateBytes";
import { generateCsharpCode, generateRustCode, generateTsCode } from "./GenerateCode";
import { generateFbs } from "./GenerateFbs";
import { generateJson } from "./GenerateJson";
import { generateVersion } from './GenerateVersion';
import { Initialize } from "./Initialize";
import { paths } from "./Paths";
import { testBytes } from "./TestBytes";
import { walkDir } from '../tools/FileUtil';

export async function buildFlat() {

    console.log('========================================');
    const csv_all = await Initialize();
    console.log('========================================\n');

    console.log('========================================');
    console.log('生成 fbs 文件');
    console.log('----------------------------------------');
    await generateFbs(csv_all);
    console.log('========================================\n');

    console.log('========================================');
    console.log('复制其他 fbs 文件');
    console.log('----------------------------------------');
    const other_fbs = await walkDir(paths.other_fbs, '.fbs');
    for (const file_path of other_fbs) {
        const full_path = path.join(paths.other_fbs, file_path);
        const target_path = path.join(paths.fbs, file_path);
        console.log('复制', file_path);
        await fs.copyFile(full_path, target_path);
    }
    console.log('========================================\n');

    console.log('========================================');
    console.log('生成代码');
    console.log('----------------------------------------');
    await generateTsCode();
    await generateCsharpCode();
    await generateRustCode();
    console.log('========================================\n');

    console.log('========================================');
    console.log('生成json');
    console.log('----------------------------------------');
    await generateJson(csv_all);
    console.log('========================================\n');

    console.log('========================================');
    console.log('生成二进制数据');
    console.log('----------------------------------------');
    await generateBytes(csv_all);
    console.log('========================================\n');

    console.log('========================================');
    console.log('校验二进制数据');
    console.log('----------------------------------------');
    await testBytes(csv_all);
    console.log('========================================\n');

    console.log('========================================');
    console.log('生成配置文件版本');
    console.log('----------------------------------------');
    await generateVersion(csv_all, path.join(paths.bytes, 'version.bytes'));
    console.log('========================================\n');

    console.log('');
    console.log('完成');
}
