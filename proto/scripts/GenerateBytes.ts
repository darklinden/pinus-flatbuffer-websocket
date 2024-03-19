import * as path from "path";
import { promises as fs } from "fs";
import { execSync } from "child_process";
import { chdir } from "process";

import { paths } from "./Paths"
import { CsvAll } from "./Initialize";

export async function generateBytes(csv_all: CsvAll): Promise<void> {

    console.log('正在生成二进制文件');

    for (const key in csv_all.tables) {

        const table = csv_all.tables[key];

        const class_relative_path = table.class_relative_path;
        const fbs_path = path.join(paths.fbs, class_relative_path + '.fbs');

        const data_relative_paths = table.data_relative_paths;

        for (const data_relative_path of data_relative_paths) {
            const json_path = path.join(paths.json, data_relative_path + '.json');

            let bytes_path = path.join(paths.bytes, data_relative_path + '.bin');
            await fs.mkdir(path.dirname(bytes_path), { recursive: true });

            console.log(`使用 ${path.basename(fbs_path)} 导出 ${path.basename(json_path)} 数据 ${bytes_path}`);

            const command = `${paths.flatc} --binary ${fbs_path} ${json_path}`;
            console.log(command);
            chdir(path.dirname(bytes_path));
            execSync(command);
        }
    }
}