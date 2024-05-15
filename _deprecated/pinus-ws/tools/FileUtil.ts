import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as path from "path";

export async function fileMd5(file_path: string) {
    const content = await fs.readFile(file_path, { encoding: 'utf8' });
    return crypto.createHash('md5').update(content).digest("hex");
}

export async function fileExist(file_path: string): Promise<boolean> {
    let exist = false;
    try {
        await fs.access(file_path);
        exist = true;
    } catch (error) {
    }
    return exist;
}

export async function fileEqual(file_path1: string, file_path2: string): Promise<boolean> {
    const exist1 = await fileExist(file_path1);
    const exist2 = await fileExist(file_path2);
    if (exist1 != exist2) return false;
    if (!exist1 && !exist2) return true;

    const md5_1 = await fileMd5(file_path1);
    const md5_2 = await fileMd5(file_path2);
    return md5_1 == md5_2;
}

export async function walkDir(root: string, ext: string | string[] = [], relative: string = ''): Promise<string[]> {
    // ext -> string[] like [".js", ".css"] or any other extensions
    if (!ext) ext = [];
    if (typeof ext == 'string') ext = [ext];

    const full = path.join(root, relative);
    const files: string[] = [];
    const dir_content = await fs.readdir(full);
    for (let i = 0; i < dir_content.length; i++) {
        const f = dir_content[i];
        const file_path = path.join(full, f);
        const stat = await fs.stat(file_path);

        if (stat?.isDirectory()) {
            const sub = path.join(relative, f);
            const sub_files = await walkDir(root, ext, sub);
            files.push(...sub_files);
        }
        else {
            if (ext.length == 0 || ext.includes(path.extname(f)))
                files.push(path.join(relative, f));
        }
    }
    return files;
}

export async function relativeCopy(
    from: string,
    to: string,
    extensions: string[], // extensions [".js", ".css"] or any other extensions
    skip_check = false) {

    if (!from || !to) {
        throw new Error('invalid arguments');
    }

    if (!await fileExist(from)) {
        throw new Error('from not exist: ' + from);
    }

    const stat_from = await fs.stat(from);
    if (!stat_from?.isDirectory()) {
        // copy file

        if (skip_check || !await fileEqual(from, to)) {
            console.log('copy file: ' + from + ' -> ' + to);
            await fs.mkdir(path.dirname(to), { recursive: true });
            await fs.copyFile(from, to);
        }
        else {
            console.log('skip file: ' + from);
        }

        return;
    }

    // copy folder
    console.log('copy files from: ' + from);
    console.log('\tto: ' + to);
    console.log('\textensions: ' + JSON.stringify(extensions));
    console.log('');

    await fs.mkdir(to, { recursive: true });

    let file_total = 0;
    let file_copied = 0;

    let dir_content = await walkDir(from);

    for (let i = 0; i < dir_content.length; i++) {
        const relative = dir_content[i];
        const ext = path.extname(relative);

        // console.log('\tcheck file: ' + relative);
        if (!extensions || extensions.length <= 0 || extensions.indexOf(ext) != -1) {
            const src = path.join(from, relative);
            const des = path.join(to, relative);

            if (skip_check || !await fileEqual(src, des)) {
                console.log('\tcopied file: ' + relative);
                await fs.mkdir(path.dirname(des), { recursive: true });
                await fs.copyFile(src, des);
                file_copied++;
            }
            else {
                // console.log('build. skip copy equal config file: ' + relative);
            }
            file_total++;
        }
    }

    console.log('total:  \t' + file_total + '\tcopied: \t' + file_copied + '\tskipped:\t' + (file_total - file_copied));
    console.log('copy done.');
    console.log('');
}