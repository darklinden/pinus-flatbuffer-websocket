import { execSync } from "child_process";
import fs = require("fs");
import path = require("path");
import { chdir } from "process";

import { paths } from "./Paths"

export function generate_bytes(fbs_to_json: [string, string][]): [string, string, string][] {

    console.log('正在生成二进制文件');

    const bytes_path_list: [string, string, string][] = [];

    for (const item of fbs_to_json) {

        const fbs_path = item[0];
        const json_path = item[1];

        let bytes_path = path.join(path.dirname(fbs_path), path.basename(fbs_path, '.fbs') + '.bin');
        bytes_path = path.join(paths.bytes, bytes_path.slice(paths.fbs.length + 1));
        fs.mkdirSync(path.dirname(bytes_path), { recursive: true });

        console.log(`使用 ${path.basename(fbs_path)} 导出 ${path.basename(json_path)} 数据 ${bytes_path}`);

        const command = `${paths.flatc} --binary ${fbs_path} ${json_path}`;
        console.log(command);
        chdir(path.dirname(bytes_path));
        execSync(command);

        bytes_path_list.push([fbs_path, json_path, bytes_path]);
        // fs.renameSync(path.basename(bytes_path, '.bytes') + '.bin', bytes_path);
    }

    return bytes_path_list;
}