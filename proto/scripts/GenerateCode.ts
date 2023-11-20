import { promises as fs } from "fs";
import * as path from "path";
import { execSync } from "child_process";

import { paths } from "./Paths";
import { walkDir } from "../tools/FileUtil";


export async function generateTsCode() {

    console.log(`生成 typescript 代码`);

    const fbs_path_list = await walkDir(paths.fbs, '.fbs');

    for (const file_path of fbs_path_list) {
        const full_path = path.join(paths.fbs, file_path);
        const command = `${paths.flatc} --ts -o ${paths.ts} ${full_path} --gen-object-api`;
        // console.log(command);
        execSync(command);
    }

    // replace Class function simple
    const file_path_list = await walkDir(paths.ts, '.ts');
    for (const file_path of file_path_list) {
        let origin_path = path.join(paths.ts, file_path);
        let origin = await fs.readFile(origin_path, 'utf8');

        const clazzes = [];
        const lines = origin.split('\n');
        for (let i = 0; i < lines.length; i++) {

            const mc = lines[i].match(/export class (\w+) (implements .* )*{/);
            if (mc) {
                clazzes.push(mc[1]);
            }

            let xline = '' + lines[i];
            if (xline.trimStart().startsWith('pack(')) {
                xline = xline.replace('pack(', 'pack?(');
                console.log(`修改生成的ts代码: ${file_path}`);
                console.log(`修改: ${lines[i]} -> ${xline}`);
                lines[i] = xline;
            }

            if (xline.trimStart().startsWith('unpack(')) {
                xline = xline.replace('unpack(', 'unpack?(');
                console.log(`修改生成的ts代码: ${file_path}`);
                console.log(`修改: ${lines[i]} -> ${xline}`);
                lines[i] = xline;
            }
        }

        origin = lines.join('\n');

        for (const clazz of clazzes) {
            const regAs = new RegExp(`As${clazz}\\(`, 'g');
            origin = origin.replace(regAs, '(');

            const regEnd = new RegExp(`end${clazz}\\(`, 'g');
            origin = origin.replace(regEnd, 'end(');

            const regCreate = new RegExp(`create${clazz}\\(`, 'g');
            origin = origin.replace(regCreate, 'create(');
        }

        await fs.writeFile(origin_path, origin);
    }
}

export async function generateCsharpCode() {

    console.log(`生成 csharp 代码`);

    const fbs_path_list = await walkDir(paths.fbs, '.fbs');

    for (const file_path of fbs_path_list) {
        if (file_path.startsWith('ServerOnly')) {
            continue;
        }
        const full_path = path.join(paths.fbs, file_path);
        const command = `${paths.flatc} --csharp -o ${paths.csharp} ${full_path} --gen-object-api`;
        // console.log(command);
        execSync(command);
    }

    const csharp_path_list = await walkDir(paths.csharp, '.cs');
    for (const file_path of csharp_path_list) {

        let origin_path = path.join(paths.csharp, file_path);

        console.log(`修改生成的CSharp代码: ${file_path}`);

        let origin = await fs.readFile(origin_path, 'utf8');

        const clazzes = [];
        const lines = origin.split('\n');
        for (const line of lines) {
            const mc = line.match(/public struct (\w+) : IFlatbufferObject/);
            if (mc) {
                clazzes.push(mc[1]);
            }
        }

        console.log(`检测到 struct: ${clazzes}`);

        for (const clazz of clazzes) {
            const regAs = new RegExp(`GetRootAs${clazz}\\(`, 'g');
            origin = origin.replace(regAs, 'GetRoot(');

            const regEnd = new RegExp(`End${clazz}\\(`, 'g');
            origin = origin.replace(regEnd, 'End(');

            const regCreate = new RegExp(`Create${clazz}\\(`, 'g');
            origin = origin.replace(regCreate, 'Create(');

            const regFinish = new RegExp(`Finish${clazz}Buffer\\(`, 'g');
            origin = origin.replace(regFinish, 'Finish(');
        }

        await fs.writeFile(origin_path, origin);
    }
}

export async function generateRustCode() {
    console.log(`生成 rust 代码`);

    const fbs_path_list = await walkDir(paths.fbs, '.fbs');

    let mod_list: string[] = [];
    for (const file_path of fbs_path_list) {
        const full_path = path.join(paths.fbs, file_path);
        const command = `${paths.flatc} --rust -o ${paths.rust} ${full_path} --rust-module-root-file --gen-object-api --gen-name-strings`;
        // console.log(command);
        execSync(command);

        const mod_content = await fs.readFile(path.resolve(paths.rust, "mod.rs"));

        let content_begin = false;
        const lines = mod_content.toString().split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (content_begin) {
                if (line.startsWith('} ')) {
                    content_begin = false;
                    break;
                }
                else {
                    if (line.trim() != '') {
                        if (!mod_list.includes(line)) {
                            mod_list.push(line);
                        }
                    }
                }
            }
            else {
                if (line.startsWith('  use super::*;')) {
                    content_begin = true;
                    continue;
                }
            }
        }
    }

    fs.rm(path.resolve(paths.rust, "mod.rs"));

    const mod =
        `// Automatically generated by the Flatbuffers compiler. Do not modify.
// @generated
#![allow(warnings)]
pub mod proto {
use super::*;
${mod_list.join('\n')}

} // proto`;

    await fs.writeFile(path.resolve(paths.rust, "lib.rs"), mod);

}

export async function generateCode(target_folder: string, language_sign: string, flag: string = '') {
    console.log(`生成 ${language_sign} 代码`);

    const fbs_path_list = await walkDir(paths.fbs, '.fbs');
    for (const file_path of fbs_path_list) {
        const full_path = path.join(paths.fbs, file_path);
        const command = `${paths.flatc} --${language_sign} -o ${target_folder} ${full_path} ${flag}`;
        // console.log(command);
        execSync(command);
    }
}