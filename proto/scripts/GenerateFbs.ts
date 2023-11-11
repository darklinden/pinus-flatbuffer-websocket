import { promises as fs } from 'fs';
import * as path from "path";
import { paths, IPathStruct } from "./Paths"
import { CsvUtil } from "./CsvUtil";
import { BaseDataTypes } from "./BaseDataTypes";
import { exit } from 'process';
import { fileExist, walkDir } from "../tools/FileUtil";

interface IResolveCsvFbsPathResult {
    name: string;
    fbs_path: string;
}

async function resolveCsvFbsPath(file_path: string): Promise<IResolveCsvFbsPathResult> {
    let name = path.basename(file_path).split('.')[0];
    let fbs_name = null;

    // XXXEnum.csv -> XXX.fbs
    if (name.endsWith('Enum')) {
        name = name.slice(0, -4);
        fbs_name = name;
    }
    // XXXStruct.csv -> XXX.fbs
    else if (name.endsWith('Struct')) {
        name = name.slice(0, -6);
        fbs_name = name;
    }
    // XXXTable.csv -> XXX.fbs
    else if (name.endsWith('Table')) {
        name = name.slice(0, -5);
        fbs_name = name;

        // 检查拆表
        if (fbs_name.indexOf('@') != -1) {
            fbs_name = fbs_name.split('@')[0];
        }

        // 检查复用类
        const content = await fs.readFile(file_path, 'utf-8');
        const lines = content.split('\n');
        if (lines[0].startsWith('#class')) {
            fbs_name = lines[0].split(' ')[1];
        }
    }

    name = name.trim();
    fbs_name = fbs_name.trim();
    let folder = path.dirname(file_path);
    let relative_folder = folder.slice(paths.csv.length + 1);
    let fbs_path = path.join(paths.fbs, relative_folder, fbs_name + '.fbs');

    return { name, fbs_path };
}

async function csv2FbsEnum(file_path: string, name: string): Promise<string> {

    console.log('导出 csv 为枚举', file_path, name);

    let rows = await CsvUtil.loadDataSync(file_path);

    let enum_value_type = 'byte';
    if (rows[0][0].startsWith('#int')) {
        enum_value_type = 'int32';
    }

    let enum_str = `enum ${name} : ${enum_value_type} {\n`;
    for (let row of rows) {
        if (row[0].startsWith('#')) {
            // 跳过表头和注释
            continue;
        }

        if (row.length <= 0 || (row.length > 0 && row[0].trim().length == 0)) {
            // 跳过空行
            continue;
        }

        let comment = row[2] || '';
        enum_str += `    ${row[0]} = ${row[1]}, // ${comment} \n`;
    }
    enum_str += '}\n';
    return enum_str;
}

interface ICsv2FbsStructResult {
    struct: string;
    includes: string[];
}

async function csv2FbsStruct(file_path: string, name: string): Promise<ICsv2FbsStructResult> {

    console.log('导出 csv 文件为结构体', file_path, name);

    let rows = await CsvUtil.loadDataSync(file_path);

    let includes: string[] = [];

    // 字段名, 字段类型, 注释
    let table_str = `table ${name} {\n`;
    for (let row of rows) {
        if (row[0].startsWith('#')) {
            // 跳过表头和注释
            continue;
        }

        if (row.length <= 0 || (row.length == 1 && row[0] === '')) {
            // 跳过空行
            continue;
        }

        let comment = row[2] || '';
        let var_type = row[1].trim();
        // 如果是数组类型，取内部类型
        if (var_type.startsWith('[') && var_type.endsWith(']'))
            var_type = var_type.slice(1, -1);
        if (BaseDataTypes.indexOf(var_type) == -1 && includes.indexOf(var_type) == -1) {
            // console.log('includes', var_type, row);
            includes.push(var_type);
        }
        table_str += `    ${row[0]}:${row[1]}; // ${comment} \n`;
    }
    table_str += '}\n';
    return { struct: table_str, includes: includes };
}

interface ICsv2FbsTableResult {
    table_name: string;
    table_struct: string;
    includes: string[];
}

async function csv2FbsTable(file_path: string, name: string): Promise<ICsv2FbsTableResult> {

    console.log('\n导出 csv 文件为表', file_path, name);

    let rows = await CsvUtil.loadDataSync(file_path);
    let header: string[];
    let reuse_class = null;
    for (const row of rows) {
        if (row[0].startsWith('#class')) {
            reuse_class = row[0].split(' ')[1];
            continue;
        }
        else if (row[0].startsWith('#')) {
            // 跳过表头和注释
            continue;
        }
        header = row;
        break;
    }

    if (reuse_class && reuse_class.length > 0) {
        // 重用类 #class XXX
        name = reuse_class;
        name = name.trim();
    }

    let includes: string[] = [];

    // 字段名, 字段类型, 注释
    let table_str = `table ${name}Row {\n`;
    for (let item of header) {
        if (item.trim() == '') {
            continue
        }
        if (item.startsWith('#')) {
            // 跳过注释
            // console.log('跳过注释', item);
            continue;
        }

        try {

            // console.log('读取行', item);

            const tmp = item.split('|');
            const comment = tmp[0];
            const data = tmp[1];
            const variable = data.split(':');
            const variable_name = variable[0];
            let data_type = variable[1];
            data_type = data_type.trim();

            let var_type = data_type.trim();
            // 如果是数组类型，取内部类型
            if (var_type.startsWith('[') && var_type.endsWith(']'))
                var_type = var_type.slice(1, -1);
            if (BaseDataTypes.indexOf(var_type) == -1 && includes.indexOf(var_type) == -1) {
                // console.log('生成引用', var_type);
                includes.push(var_type);
            }

            // 重用类 #class XXX 不生成注释
            table_str += `    ${variable_name}:${data_type};\n`;

            console.log('生成字段', variable_name, data_type, comment);

        } catch (error) {
            console.log('csv_to_fbs_table error', item, error);
            throw error;
        }
    }
    table_str += '}\n';

    table_str += `table ${name} {\n`;
    table_str += `    rows:[${name}Row];\n`;
    table_str += '}\n';

    table_str += `root_type ${name};\n`;

    return { table_name: name, table_struct: table_str, includes: includes };
}

export function getFbsPath(
    name: string,
    enums: { [key: string]: IPathStruct },
    structs: { [key: string]: IPathStruct },
    tables: { [key: string]: IPathStruct }
): IPathStruct {
    if (enums.hasOwnProperty(name))
        return enums[name];
    else if (structs.hasOwnProperty(name))
        return structs[name];
    else if (tables.hasOwnProperty(name))
        return tables[name];
    else
        return null;
}

export async function generateFbs(): Promise<{
    enums: { [key: string]: IPathStruct }
    structs: { [key: string]: IPathStruct }
    tables: { [key: string]: IPathStruct }
}> {
    const csv_path_list = await walkDir(paths.csv, '.csv')
    csv_path_list.sort((x: string, y: string): number => {

        const x_name = path.basename(x, 'csv');
        const y_name = path.basename(y, 'csv');

        const x_is_enum = x_name.endsWith('Enum') ? -1 : 1
        const y_is_enum = y_name.endsWith('Enum') ? -1 : 1
        const x_is_struct = x_name.endsWith('Struct') ? -1 : 1
        const y_is_struct = y_name.endsWith('Struct') ? -1 : 1

        if (x_is_enum != y_is_enum)
            return x_is_enum - y_is_enum

        if (x_is_struct != y_is_struct)
            return x_is_struct - y_is_struct

        return 0
    });

    // console.log('csv_path_list', csv_path_list);

    // 所有结构名
    const fbs_all_name_list: string[] = [];

    // 枚举名: csv文件路径 fbs文件路径
    const enums: { [key: string]: IPathStruct } = {}

    // 结构体名: csv文件路径 fbs文件路径
    const structs: { [key: string]: IPathStruct } = {}

    // 表名: csv文件路径 fbs文件路径 表引用的类型名
    const tables: { [key: string]: IPathStruct } = {}

    // 生成基础结构表，用于生成include
    for (const f_path of csv_path_list) {
        const csv_path = path.join(paths.csv, f_path);

        // 忽略正在编辑时的临时文件
        if (path.basename(csv_path).startsWith('~$'))
            continue

        // 忽略注释文件
        if (path.basename(csv_path).startsWith('#'))
            continue

        // 生成枚举 fbs, 枚举文件必须为枚举名 + Enum
        if (path.basename(csv_path).endsWith('Enum.csv')) {
            const { name, fbs_path } = await resolveCsvFbsPath(csv_path);
            if (fbs_all_name_list.indexOf(name) != -1)
                throw new Error(`重复的枚举名: ${name}`);
            enums[name] = { csv: csv_path, fbs: fbs_path };
            fbs_all_name_list.push(name);
        }

        // 生成结构体 fbs, 结构体文件必须为结构体名 + Struct
        else if (path.basename(csv_path).endsWith('Struct.csv')) {
            const { name, fbs_path } = await resolveCsvFbsPath(csv_path);
            if (fbs_all_name_list.indexOf(name) != -1)
                throw new Error(`重复的结构体名: ${name}`);
            structs[name] = { csv: csv_path, fbs: fbs_path };
            fbs_all_name_list.push(name);
        }

        // 生成表 fbs, 表文件必须为表名 + Table
        else if (path.basename(csv_path).endsWith('Table.csv')) {
            const { name, fbs_path } = await resolveCsvFbsPath(csv_path);
            if (fbs_all_name_list.indexOf(name) != -1)
                throw new Error(`重复的表名: ${name}`);
            tables[name] = { csv: csv_path, fbs: fbs_path };
            fbs_all_name_list.push(name);
        }

        // 如果存在其他文件则报错
        else {
            throw new Error(`仅支持文件名末尾标注 Enum Struct Table, 未知的 csv 文件: ${csv_path}`);
        }
    }

    // 生成枚举 fbs
    for (const name in enums) {
        const p = enums[name];
        let enum_fbs = "namespace Proto;\n\n";
        enum_fbs += await csv2FbsEnum(p.csv, name);
        await fs.mkdir(path.dirname(p.fbs), { recursive: true });
        await fs.writeFile(p.fbs, enum_fbs, 'utf8');
    }

    // 生成结构体 fbs
    for (const name in structs) {
        const p = structs[name];

        const { struct, includes } = await csv2FbsStruct(p.csv, name);
        const fbs_dir = path.dirname(p.fbs);

        let struct_fbs: string = '';
        for (const include of includes) {
            // console.log('include', include);
            var include_path = getFbsPath(include, enums, structs, tables)
            if (!include_path) {
                throw new Error(`结构体 ${name} 引用了不存在的类型 ${include}`);
            }
            let include_relative_path = path.join(path.relative(fbs_dir, path.dirname(include_path.fbs)), path.basename(include_path.fbs));
            if (process.platform == 'win32' || process.platform == 'cygwin') {
                // windows
                include_relative_path = include_relative_path.replace('\\', '/');
            }
            struct_fbs += `include "${include_relative_path}";\n`;
        }

        struct_fbs += "namespace Proto;\n\n";

        struct_fbs += struct;

        await fs.mkdir(path.dirname(p.fbs), { recursive: true });
        await fs.writeFile(p.fbs, struct_fbs, 'utf8');
    }

    // 生成表 fbs
    for (let name in tables) {
        const p = tables[name];

        // 是否为拆表
        if (name.indexOf('@') != -1) {
            console.log(`表 ${name} 为拆表 ${name.split('@')[0]} 的 分表 ${name.split('@')[1]}`);
            name = name.split('@')[0];
        }

        const {
            table_name,
            table_struct,
            includes } = await csv2FbsTable(p.csv, name);
        // 是否为复用表
        if (table_name != name) {
            console.log(`表 ${name} 为复用表 复用 ${table_name}`);
        }

        const fbs_dir = path.dirname(p.fbs);

        let table_fbs: string = '';
        for (const include of includes) {
            // console.log('include', include);
            var include_path = getFbsPath(include, enums, structs, tables)
            if (!include_path) {
                throw new Error(`表 ${name} 引用了不存在的类型 ${include}`);
            }
            let include_relative_path = path.join(path.relative(fbs_dir, path.dirname(include_path.fbs)), path.basename(include_path.fbs));
            if (process.platform == 'win32' || process.platform == 'cygwin') {
                // windows
                include_relative_path = include_relative_path.replace('\\', '/');
            }
            table_fbs += `include "${include_relative_path}";\n`;
        }

        table_fbs += "namespace Proto;\n\n";
        table_fbs += table_struct;

        await fs.mkdir(path.dirname(p.fbs), { recursive: true });

        if (await fileExist(p.fbs)) {
            const old_table_fbs = await fs.readFile(p.fbs, 'utf8');
            if (old_table_fbs != table_fbs) {
                console.error(`表 ${name} 复用表 ${table_name} 发生属性变化！！！`);
                exit(1)
            }
        }

        await fs.writeFile(p.fbs, table_fbs, 'utf8');
    }

    return {
        enums: enums,
        structs: structs,
        tables: tables,
    };
}