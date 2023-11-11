import { execSync } from "child_process";
import { chdir } from "process";
import { promises as fs } from "fs";
import * as path from "path";

import { paths } from "./Paths"
import { IGenerateBytesResult } from "./GenerateBytes";

export async function testBytes(bytes_path_list: IGenerateBytesResult[]) {

    for (const item of bytes_path_list) {

        const fbs_path = item.fbs_path;
        const json_path = item.json_path;
        const bytes_path = item.bytes_path;

        let test_path = path.join(paths.tests, json_path.slice(paths.json.length + 1));
        await fs.mkdir(path.dirname(test_path), { recursive: true });

        console.log(`使用 ${path.basename(fbs_path)} 测试数据 ${bytes_path}`);

        const command = `${paths.flatc} --json --raw-binary ${fbs_path} -- ${bytes_path} --strict-json --defaults-json`;
        // console.log(command);
        chdir(path.dirname(test_path));
        execSync(command);

        const origin_json_content = await fs.readFile(json_path, 'utf8');
        const test_json_content = await fs.readFile(test_path, 'utf8');

        const origin = JSON.parse(origin_json_content);
        const test = JSON.parse(test_json_content);

        const origin_json = JSON.stringify(origin, null, 0);
        const test_json = JSON.stringify(test, null, 0);

        if (origin_json !== test_json) {
            console.error(`测试失败 ${bytes_path}`);
            console.error(`原始数据 ${origin_json}`);
            console.error(`测试数据 ${test_json}`);
        }
        else {
            console.log(`测试成功 ${bytes_path}`);
            await fs.rename(bytes_path, bytes_path.substring(0, bytes_path.length - '.bin'.length) + '.bytes');
        }
    }
}