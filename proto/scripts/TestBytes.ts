import { execSync } from "child_process";
import { chdir } from "process";
import { promises as fs } from "fs";
import * as path from "path";

import { paths } from "./Paths"
import { CsvAll } from "./Initialize";

export async function testBytes(csv_all: CsvAll) {

    console.log('正在校验二进制文件');

    for (const key in csv_all.tables) {

        const table = csv_all.tables[key];

        const fbs_path = path.join(paths.fbs, table.class_relative_path + '.fbs');

        for (const data_relative_path of table.data_relative_paths) {

            const json_path = path.join(paths.json, data_relative_path + '.json');
            const bin_path = path.join(paths.bytes, data_relative_path + '.bin');
            const test_path = path.join(paths.tests, data_relative_path + '.json');

            await fs.mkdir(path.dirname(test_path), { recursive: true });

            console.log(`使用 ${path.basename(fbs_path)} 测试数据 ${bin_path}`);

            const command = `${paths.flatc} --json --raw-binary ${fbs_path} -- ${bin_path} --strict-json --defaults-json`;
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
                console.error(`测试失败 ${bin_path}`);
                console.error(`原始数据 ${origin_json}`);
                console.error(`测试数据 ${test_json}`);
            }
            else {
                console.log(`测试成功 ${bin_path}`);
                await fs.rename(bin_path, bin_path.substring(0, bin_path.length - '.bin'.length) + '.bytes');
            }
        }
    }
}