import { exec as process_exec } from 'node:child_process';

export async function exec(command: string, workDir: string = null): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!workDir) {
            workDir = process.cwd();
        }
        process_exec(command, { cwd: workDir }, (err, output) => {
            // once the command has completed, the callback function is called
            if (err) {
                // log and return if we encounter an error
                reject(err);
            }
            else {
                resolve(output);
            }
        })
    })
}

export async function check_git_status(path: string, workDir: string): Promise<number> {
    const git_changes_str = await exec('git status --porcelain ' + path, workDir);
    const git_changes = git_changes_str.split('\n');
    let git_change_count = 0;
    const linse = [];
    for (let git_change of git_changes) {
        git_change = git_change.trim();
        if (git_change.length > 0) {
            linse.push(git_change);
            git_change_count++;
        }
    }

    if (git_change_count > 0) {
        console.log('----------------------------------------');
        console.log('There are some sql files changed. Please commit them first.');
        console.log('----------------------------------------');
        console.log('');
        for (const line of linse) {
            console.log(line);
        }
    }

    return git_change_count;
}