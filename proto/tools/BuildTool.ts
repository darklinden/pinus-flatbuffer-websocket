import * as path from "path";
import { promises as fs } from "fs";
import { execSync } from "node:child_process";
import { fileExist, relativeCopy } from "./FileUtil";

const project_path = path.resolve(__dirname, "..");

export async function jsonEqual(file_path1: string, file_path2: string): Promise<boolean> {
    const exist1 = await fileExist(file_path1);
    const exist2 = await fileExist(file_path2);
    if (exist1 != exist2) {
        console.log('file not exist', file_path1, exist1, file_path2, exist2);
        return false;
    }
    if (!exist1 && !exist2) {
        console.log('file not exist', file_path1, exist1, file_path2, exist2);
        return false;
    }

    const json1 = JSON.parse(await fs.readFile(file_path1, 'utf8'));
    const json2 = JSON.parse(await fs.readFile(file_path2, 'utf8'));

    let jsonEquals = JSON.stringify(json1) == JSON.stringify(json2);
    if (!jsonEquals) {
        console.log('json not equal', file_path1, file_path2);
    }
    return jsonEquals;
}

export function is_git_clean(cwd: string): boolean {
    const run_cmd = execSync('git status --porcelain', { cwd: cwd });
    return run_cmd.toString().trim() == '';
}

export function git_branch(cwd: string): string {
    const run_cmd = execSync('git rev-parse --abbrev-ref HEAD', { cwd: cwd });
    return run_cmd.toString().trim();
}

export function git_last_commit(cwd: string): string {
    const run_cmd = execSync('git rev-parse HEAD', { cwd: cwd });
    return run_cmd.toString().trim();
}

export function git_last_commit_time(cwd: string): string {
    const git_last_commit_timestamp = execSync('git log -1 --format=%ct', { cwd: cwd }).toString().trim();
    let git_last_commit_date = new Date(parseInt(git_last_commit_timestamp) * 1000);
    let yyyy = git_last_commit_date.getFullYear();
    let MM = ('0' + (git_last_commit_date.getMonth() + 1)).slice(-2);
    let dd = ('0' + git_last_commit_date.getDate()).slice(-2);
    let HH = ('0' + git_last_commit_date.getHours()).slice(-2);
    let mm = ('0' + git_last_commit_date.getMinutes()).slice(-2);
    let ss = ('0' + git_last_commit_date.getSeconds()).slice(-2);
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

export async function startLocalConfigServer() {
    let src_bytes_ver = path.resolve(project_path, 'generated', 'bytes');
    let test_bytes_ver = path.resolve(project_path, 'dist');
    await relativeCopy(src_bytes_ver, test_bytes_ver, null, false);
    execSync('npx anywhere -p 8888 -s -d dist', { cwd: project_path, stdio: 'inherit' });
}
