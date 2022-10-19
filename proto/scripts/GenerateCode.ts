import path = require("path");
import fs = require("fs");
import { execSync } from "child_process";

import { paths } from "./Paths";
import { walkDirSync } from "./WalkDirSync";


export function generate_ts_code() {
    console.log(`生成 typescript 代码`);

    const fbs_path_list = walkDirSync(paths.fbs, '.fbs');

    for (const file_path of fbs_path_list) {
        const full_path = path.join(paths.fbs, file_path);
        const command = `${paths.flatc} --ts -o ${paths.ts} ${full_path} --gen-object-api`;
        // console.log(command);
        execSync(command);
    }

    // replace Class function simple
    walkDirSync(paths.ts, '.ts').forEach(file_path => {
        let origin_path = path.join(paths.ts, file_path);
        let origin = fs.readFileSync(origin_path, 'utf8');

        const clazzes = [];
        const lines = origin.split('\r');
        for (const line of lines) {

            const mc = line.match(/export class (\w+) (implements .* )*{/);
            if (mc) {
                clazzes.push(mc[1]);
            }

            const me = line.match(/export enum (\w+) {/);
            if (me) {
                clazzes.push(me[1]);
            }
        }

        for (const clazz of clazzes) {
            const regAs = new RegExp(`As${clazz}\\(`, 'g');
            origin = origin.replace(regAs, '(');

            const regEnd = new RegExp(`end${clazz}\\(`, 'g');
            origin = origin.replace(regEnd, 'end(');

            const regCreate = new RegExp(`create${clazz}\\(`, 'g');
            origin = origin.replace(regCreate, 'create(');
        }

        fs.writeFileSync(origin_path, origin);
    });
}

export function generate_code(target_folder: string, language_sign: string, flag: string = '') {
    console.log(`生成 ${language_sign} 代码`);

    const fbs_path_list = walkDirSync(paths.fbs, '.fbs');
    for (const file_path of fbs_path_list) {
        const full_path = path.join(paths.fbs, file_path);
        const command = `${paths.flatc} --${language_sign} -o ${target_folder} ${full_path} ${flag}`;
        // console.log(command);
        execSync(command);
    }
}