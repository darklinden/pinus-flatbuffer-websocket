import { execSync } from "child_process";
import fs = require("fs");
import path = require("path");
import { chdir } from "process";

import { paths } from "./Paths"

export function test_bytes(bytes_path_list: [string, string, string][]): void {

    for (const item of bytes_path_list) {

        const fbs_path = item[0];
        const json_path = item[1];
        const bytes_path = item[2];

        let test_path = path.join(path.dirname(fbs_path), path.basename(fbs_path, '.fbs') + '.json');
        test_path = path.join(paths.tests, test_path.slice(paths.fbs.length + 1));
        fs.mkdirSync(path.dirname(test_path), { recursive: true });

        console.log(`使用 ${path.basename(fbs_path)} 测试数据 ${bytes_path}`);

        const command = `${paths.flatc} --json --raw-binary ${fbs_path} -- ${bytes_path} --strict-json --defaults-json`;
        // console.log(command);
        chdir(path.dirname(test_path));
        execSync(command);

        const origin_json_content = fs.readFileSync(json_path, 'utf8');
        const test_json_content = fs.readFileSync(test_path, 'utf8');

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
            fs.renameSync(bytes_path, bytes_path.substring(0, bytes_path.length - '.bin'.length) + '.bytes');
        }
    }
}