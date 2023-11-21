import * as path from 'path';
import * as readline from 'readline';
import { config as dotenv_config } from 'dotenv';

import { check_git_status } from './check_git_status';
import { db_recreate, db_upgrade } from './db_opration';
import { RunType } from './run_type';
import { redis_flush_all } from './redis_opration';

// Upgrade 场景
// 1. 检查 sql 文件夹中的 sql 文件是否有变更，如果有变更则提示用户先提交变更
// 2. 检查 表结构版本管理表 是否存在，如果不存在则创建
// 3. 遍历 sql 文件夹中的 表结构文件夹，文件夹名为表名, 文件夹中的文件名为版本号，文件夹中的文件包含 create.sql 和 up.sql
// 4. 对于每个 表 执行以下操作
//    4.1. 检查 数据库 中是否存在 表 , 如果不存在则 使用最新版本的 create.sql 创建表, 并在 表结构版本管理表 中记录版本
//    4.2. 如果存在 表 , 则检查 表结构版本管理表 中的 版本 是否与 sql 文件夹中的最新版本一致 , 如果不一致则顺序执行 up.sql 并更新 表结构版本管理表 中的 版本
// 5. 提交事务

// ForceRecreate 场景
// 1. 检查 sql 文件夹中的 sql 文件是否有变更，如果有变更则提示用户先提交变更
// 2. 检查 表结构版本管理表 是否存在，如果不存在则创建
// 3. 遍历 sql 文件夹中的 表结构文件夹，文件夹名为表名, 文件夹中的文件名为版本号，文件夹中的文件包含 create.sql 和 up.sql
// 4. 对于每个 表 使用最新版本的 create.sql 创建表, 并在 表结构版本管理表 中记录版本
// 5. 提交事务

async function main() {

    dotenv_config();

    let arg = process.argv[process.argv.length - 1];
    let run_type = RunType.Unknown;
    switch (arg) {
        case 'test-upgrade':
            run_type = RunType.TestUpgrade;
            break;
        case 'upgrade':
            run_type = RunType.Upgrade;
            break;
        case 'test-force-recreate':
            run_type = RunType.TestForceRecreate;
            break;
        case 'force-recreate':
            run_type = RunType.ForceRecreate;
            break;
    }

    console.log('----------------------------------------');
    console.log('Run type: ', arg, run_type);
    console.log('----------------------------------------');

    if (run_type == RunType.Unknown) {
        console.log('');
        console.log('----------------------------------------');
        console.log('Please specify run type.');
        console.log('----------------------------------------');
        console.log('');
        return;
    }

    const project_root = path.resolve(__dirname, '..');
    const sql_dir = path.resolve(project_root, 'sql');

    const changes = await check_git_status(sql_dir, project_root);
    if (changes > 0) {
        console.log('');
        console.log('----------------------------------------');
        console.log('There are some sql files changed. Please commit them first.');
        console.log('----------------------------------------');
        console.log('');

        return;
    }

    if (run_type == RunType.Upgrade || run_type == RunType.ForceRecreate) {
        console.log('----------------------------------------');
        console.log('You are going to ' + RunType[run_type] + ' database.');
        console.log('This operation may lost data or schema in database.');
        console.log('Ensure that a recovery dump has been saved!');
        console.log('Ensure that a recovery dump has been saved!');
        console.log('Ensure that a recovery dump has been saved!');
        console.log(process.env.DATABASE_URL);
        console.log('----------------------------------------');

        const ans = await ask_question('Are you sure to continue? (Yes/n) ');
        if (ans != 'Yes') {
            console.log('----------------------------------------');
            console.log('Operation canceled.');
            console.log('----------------------------------------');
            process.exit(0);
        }
    }

    console.log('----------------------------------------');
    console.log('Start to ' + RunType[run_type] + ' database.');
    console.log('----------------------------------------');

    switch (run_type) {
        case RunType.TestUpgrade:
        case RunType.Upgrade:
            await db_upgrade(sql_dir, run_type);
            break;

        case RunType.TestForceRecreate:
        case RunType.ForceRecreate:
            await db_recreate(sql_dir, run_type);
            break;

        default:
            console.log('----------------------------------------');
            console.log('Unknown run type.');
            console.log('----------------------------------------');
            console.log('');
            break;
    }

    if (run_type == RunType.TestUpgrade || run_type == RunType.TestForceRecreate) {
        console.log('');
        console.log('----------------------------------------');
        console.log('Test success.');
        console.log('----------------------------------------');
        console.log('');
        return;
    }

    await redis_flush_all();

    console.log('Done.');
}

main();


async function ask_question(query: string): Promise<string> {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

