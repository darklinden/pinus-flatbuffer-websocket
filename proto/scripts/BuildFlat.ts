import fs = require('fs');
import path = require('path');

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

    await Initialize();

    console.log('========================================');
    console.log('生成 fbs 文件');
    console.log('----------------------------------------');
    const obj = await generateFbs();
    console.log('========================================\n');

    console.log('========================================');
    console.log('复制其他 fbs 文件');
    console.log('----------------------------------------');
    const other_fbs = await walkDir(paths.other_fbs, '.fbs');
    for (const file_path of other_fbs) {
        const full_path = path.join(paths.other_fbs, file_path);
        const target_path = path.join(paths.fbs, file_path);
        fs.copyFileSync(full_path, target_path);
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
    const fbs_to_json = await generateJson(obj);
    console.log('========================================\n');

    console.log('========================================');
    console.log('生成二进制数据');
    console.log('----------------------------------------');
    const bytes_path_list = await generateBytes(fbs_to_json);
    console.log('========================================\n');

    console.log('========================================');
    console.log('校验二进制数据');
    console.log('----------------------------------------');
    await testBytes(bytes_path_list);
    console.log('========================================\n');

    console.log('========================================');
    console.log('生成配置文件版本');
    console.log('----------------------------------------');
    await generateVersion(bytes_path_list, path.join(paths.bytes, 'version.bytes'));
    console.log('========================================\n');

    console.log('');
    console.log('完成');
}
