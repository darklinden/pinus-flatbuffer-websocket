import { execSync } from "child_process";
import { chdir } from "process";
import { promises as fs } from "fs";
import * as path from "path";

import { paths } from "./Paths"

export interface IGenerateBytesResult {
    fbs_path: string;
    json_path: string;
    bytes_path: string;
}

export async function generateBytes(fbs_to_json: { fbs_path: string, json_path: string }[]): Promise<IGenerateBytesResult[]> {

    console.log('正在生成二进制文件');

    const bytes_path_list: IGenerateBytesResult[] = [];

    for (const item of fbs_to_json) {

        const fbs_path = item.fbs_path;
        const json_path = item.json_path;

        let bytes_path = path.join(path.dirname(json_path), path.basename(json_path, '.json') + '.bin');
        bytes_path = path.join(paths.bytes, bytes_path.slice(paths.json.length + 1));

        await fs.mkdir(path.dirname(bytes_path), { recursive: true });

        console.log(`使用 ${path.basename(fbs_path)} 导出 ${path.basename(json_path)} 数据 ${bytes_path}`);

        const command = `${paths.flatc} --binary ${fbs_path} ${json_path}`;
        console.log(command);
        chdir(path.dirname(bytes_path));
        execSync(command);

        bytes_path_list.push({ fbs_path, json_path, bytes_path });
        // fs.renameSync(path.basename(bytes_path, '.bytes') + '.bin', bytes_path);
    }

    return bytes_path_list;
}