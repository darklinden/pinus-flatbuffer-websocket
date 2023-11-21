import { Client } from 'pg';
import * as path from 'path';
import { promises as fs } from 'fs';
import { process_sql_file } from './process_sql_file';
import { RunType } from './run_type';

async function bgein_transaction(client: Client): Promise<any> {
    console.log('begin transaction');
    return await client.query('BEGIN');
}

async function commit_transaction(client: Client): Promise<any> {
    console.log('commit transaction');
    return await client.query('COMMIT');
}

async function rollback_transaction(client: Client): Promise<any> {
    console.log('rollback transaction');
    return await client.query('ROLLBACK');
}

async function query(client: Client, sql: string): Promise<any> {
    if (sql.trim().length == 0) {
        throw new Error('Empty sql');
    }
    console.log('query: ', sql);
    return await client.query(sql);
}

async function table_exist(client: Client, table_name: string): Promise<boolean> {
    const res = await query(client, `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table_name}')`);
    return res.rows[0].exists;
}

async function drop_table(client: Client, table_name: string): Promise<void> {
    await query(client, `DROP TABLE IF EXISTS ${table_name} CASCADE;`);
}

// 处理数据库表结构版本管理表
async function deal_with_schema_ups(client: Client, sql_folder: string): Promise<void> {
    if (await table_exist(client, 'db_schema_ups')) {
        return;
    }

    const sql_file = path.resolve(sql_folder, 'db_schema_ups.sql');
    const sqls = await process_sql_file(sql_file);

    for (const sql of sqls) {
        await query(client, sql);
    }
}

async function query_schema_ups(client: Client, table: string): Promise<number> {
    const exist = await query(client, `SELECT EXISTS (SELECT FROM db_schema_ups WHERE table_name = '${table}')`);
    if (!exist.rows[0].exists) {
        console.log(`table ${table} not exist in db_schema_ups, hard to 0 index`);
        return 0;
    }

    const res = await query(client, `SELECT up_index FROM db_schema_ups WHERE table_name = '${table}';`);
    return res.rows[0].up_index;
}

async function mark_schema_ups(client: Client, name: string, up_to_index: number) {
    await query(client, `INSERT INTO db_schema_ups (table_name, up_index) VALUES ('${name}', ${up_to_index}) ON CONFLICT (table_name) DO UPDATE SET up_index = EXCLUDED.up_index;`);
}

async function exec_sql_file(client: Client, sql_file: string): Promise<void> {
    const sqls = await process_sql_file(sql_file);
    for (const sql of sqls) {
        await query(client, sql);
    }
}

interface TableHistory {
    table_name: string;
    vesions: { index: number, create: string, up: string }[]
}

async function list_tables(sql_folder: string): Promise<TableHistory[]> {
    const sqls = await fs.readdir(sql_folder);
    const tables: TableHistory[] = [];
    for (const table of sqls) {
        const st = await fs.stat(path.resolve(sql_folder, table));
        if (st.isDirectory()) {
            const t: TableHistory = {
                table_name: table,
                vesions: []
            };
            const table_folders = await fs.readdir(path.resolve(sql_folder, table));
            for (const index of table_folders) {
                const st = await fs.stat(path.resolve(sql_folder, table, index));
                if (st.isDirectory() == false) {
                    console.log(`table ${table} has file ${index} not folder, ignore`);
                    continue;
                }

                const v = { index: +index, create: '', up: '' };
                const sql_files = await fs.readdir(path.resolve(sql_folder, table, index));
                for (const sql_file of sql_files) {
                    if (sql_file == 'create.sql') {
                        v.create = path.resolve(sql_folder, table, index, sql_file);
                    }
                    if (sql_file == 'up.sql') {
                        v.up = path.resolve(sql_folder, table, index, sql_file);
                    }
                }
                t.vesions.push(v);
            }
            t.vesions.sort((a, b) => a.index - b.index);
            tables.push(t);
        }
    }
    return tables;
}

export async function db_upgrade(sql_folder: string, run_type: RunType): Promise<void> {

    const tables: TableHistory[] = await list_tables(sql_folder);

    const client = new Client(process.env.DATABASE_URL);
    await client.connect();
    console.log('connect to database');

    try {
        // Begin transaction
        await bgein_transaction(client);

        // 处理数据库表结构版本管理表
        await deal_with_schema_ups(client, sql_folder);

        // 处理数据库表结构
        for (const table of tables) {
            const name = table.table_name;

            console.log(``);
            console.log(`deal with table ${name}`);

            const exist = await table_exist(client, name);
            if (!exist) {
                // 创建最新表
                const ver = table.vesions[table.vesions.length - 1];
                await exec_sql_file(client, ver.create);
                await mark_schema_ups(client, name, ver.index);
            }
            else {
                // 检查表结构版本
                const up_index = await query_schema_ups(client, name);
                let up_to_index = -1;
                let start_schema_up = false;
                for (const ver of table.vesions) {
                    if (start_schema_up) {
                        await exec_sql_file(client, ver.up);
                        up_to_index = ver.index;
                    }
                    else {
                        if (ver.index == up_index) {
                            start_schema_up = true;
                        }
                    }
                }
                if (start_schema_up) {
                    // 如果版本列表内有现有版本
                    if (up_to_index != -1) {
                        // 如果更新到了某个版本 标记版本
                        mark_schema_ups(client, name, up_to_index);
                    }
                    else {
                        // 如果没有更新到任何版本，说明当前为最新版本
                    }
                }
                else {
                    // 如果版本列表内没有现有版本，说明出现了版本错误
                    throw new Error(`table ${name} version ${up_index} error`);
                }
            }
        }

        console.log('');
        console.log('----------------------------------------');
        console.log('Database upgrade success.');
        console.log('----------------------------------------');
        console.log('');

        if (run_type == RunType.Upgrade) {
            console.log('run up');
            await commit_transaction(client);
        }
        else {
            console.log('is running test, rollback');
            await rollback_transaction(client);
        }
    } catch (e) {
        rollback_transaction(client);
        throw e
    } finally {
        console.log('close client');
        await client.end()
    }
}

export async function db_recreate(sql_folder: string, run_type: RunType): Promise<void> {

    const tables: TableHistory[] = await list_tables(sql_folder);

    const client = new Client(process.env.DATABASE_URL);
    await client.connect();
    console.log('connect to database');

    try {
        // Begin transaction
        await bgein_transaction(client);

        // 处理数据库表结构版本管理表
        await deal_with_schema_ups(client, sql_folder);

        // 处理数据库表结构
        for (const table of tables) {
            const name = table.table_name;

            console.log(``);
            console.log(`deal with table ${name}`);
            // 创建最新表
            await drop_table(client, name);
            const ver = table.vesions[table.vesions.length - 1];
            await exec_sql_file(client, ver.create);
            await mark_schema_ups(client, name, ver.index);
        }

        console.log('');
        console.log('----------------------------------------');
        console.log('Database recreate success.');
        console.log('----------------------------------------');
        console.log('');

        if (run_type == RunType.ForceRecreate) {
            console.log('run up');
            await commit_transaction(client);
        }
        else {
            console.log('is running test, rollback');
            await rollback_transaction(client);
        }
    } catch (e) {
        rollback_transaction(client);
        throw e
    } finally {
        console.log('close client');
        await client.end()
    }
}
