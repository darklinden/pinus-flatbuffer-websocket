import fs = require('fs');
import path = require("path");

import { paths, IPathStruct } from "./Paths"
import { CsvUtil } from "./CsvUtil";
import { BaseDataTypes } from "./BaseDataTypes";
import { walkDirSync } from './WalkDirSync';

function resolve_csv_fbs_path(file_path: string): [string, string] {
    let name = path.basename(file_path).split('.')[0];

    // XXXEnum.csv -> XXX.fbs
    if (name.endsWith('Enum')) {
        name = name.slice(0, -4);
    }
    // XXXStruct.csv -> XXX.fbs
    else if (name.endsWith('Struct')) {
        name = name.slice(0, -6);
    }
    // XXXTable.csv -> XXX.fbs
    else if (name.endsWith('Table')) {
        name = name.slice(0, -5);
    }

    let folder = path.dirname(file_path);
    let fbs_path = path.join(folder, name + '.fbs');
    fbs_path = path.join(
        paths.fbs, fbs_path.slice(paths.csv.length + 1));

    return [name, fbs_path];
}

function csv_to_fbs_enum(file_path: string, name: string): string {

    console.log('导出 csv 为枚举', file_path, name);

    let rows = CsvUtil.loadDataSync(file_path);

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

        if (row.length <= 0 || (row.length == 1 && row[0] === '')) {
            // 跳过空行
            continue;
        }

        let comment = row[2] || '';
        enum_str += `    ${row[0]} = ${row[1]}, // ${comment} \n`;
    }
    enum_str += '}\n';
    return enum_str;
}

function csv_to_fbs_struct(file_path: string, name: string): [string, string[]] {

    console.log('导出 csv 文件为结构体', file_path, name);

    let rows = CsvUtil.loadDataSync(file_path);

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
    return [table_str, includes];
}

function csv_to_fbs_table(file_path: string, name: string): [string, string[]] {

    console.log('\n导出 csv 文件为表', file_path, name);

    let rows = CsvUtil.loadDataSync(file_path);
    let header: string[];
    for (const row of rows) {
        if (row[0].startsWith('#')) {
            // 跳过表头和注释
            continue;
        }
        header = row;
        break;
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

            console.log('读取行', item);

            const tmp = item.split('|')
            const comment = tmp[0]
            const data = tmp[1]
            const variable = data.split(':')
            const variable_name = variable[0]
            const data_type = variable[1]

            let var_type = data_type.trim();
            // 如果是数组类型，取内部类型
            if (var_type.startsWith('[') && var_type.endsWith(']'))
                var_type = var_type.slice(1, -1);
            if (BaseDataTypes.indexOf(var_type) == -1 && includes.indexOf(var_type) == -1) {
                console.log('生成引用', var_type);
                includes.push(var_type);
            }
            table_str += `    ${variable_name}:${data_type}; // ${comment} \n`;
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

    return [table_str, includes];
}

export function get_fbs_path(
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

export function generate_fbs(): {
    enums: { [key: string]: IPathStruct }
    structs: { [key: string]: IPathStruct }
    tables: { [key: string]: IPathStruct }
} {
    const csv_path_list = walkDirSync(paths.csv, '.csv')
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

        // 生成枚举 fbs, 枚举文件必须为枚举名 + Enum
        if (path.basename(csv_path).endsWith('Enum.csv')) {
            const [name, fbs_path] = resolve_csv_fbs_path(csv_path);
            if (fbs_all_name_list.indexOf(name) != -1)
                throw new Error(`重复的枚举名: ${name}`);
            enums[name] = { csv: csv_path, fbs: fbs_path };
            fbs_all_name_list.push(name);
        }

        // 生成结构体 fbs, 结构体文件必须为结构体名 + Struct
        else if (path.basename(csv_path).endsWith('Struct.csv')) {
            const [name, fbs_path] = resolve_csv_fbs_path(csv_path);
            if (fbs_all_name_list.indexOf(name) != -1)
                throw new Error(`重复的结构体名: ${name}`);
            structs[name] = { csv: csv_path, fbs: fbs_path };
            fbs_all_name_list.push(name);
        }

        // 生成表 fbs, 表文件必须为表名 + Table
        else if (path.basename(csv_path).endsWith('Table.csv')) {
            const [name, fbs_path] = resolve_csv_fbs_path(csv_path);
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
        enum_fbs += csv_to_fbs_enum(p.csv, name);
        fs.mkdirSync(path.dirname(p.fbs), { recursive: true });
        fs.writeFileSync(p.fbs, enum_fbs, 'utf8');
    }

    // 生成结构体 fbs
    for (const name in structs) {
        const p = structs[name];

        const [struct_, includes] = csv_to_fbs_struct(p.csv, name);
        const fbs_dir = path.dirname(p.fbs);

        let struct_fbs: string = '';
        for (const include of includes) {
            // console.log('include', include);
            var include_path = get_fbs_path(include, enums, structs, tables)
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

        struct_fbs += struct_;

        fs.mkdirSync(path.dirname(p.fbs), { recursive: true });
        fs.writeFileSync(p.fbs, struct_fbs, 'utf8');
    }

    // 生成表 fbs
    for (const name in tables) {
        const p = tables[name];

        const [table_, includes] = csv_to_fbs_table(p.csv, name);
        const fbs_dir = path.dirname(p.fbs);

        let table_fbs: string = '';
        for (const include of includes) {
            // console.log('include', include);
            var include_path = get_fbs_path(include, enums, structs, tables)
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
        table_fbs += table_;

        fs.mkdirSync(path.dirname(p.fbs), { recursive: true });
        fs.writeFileSync(p.fbs, table_fbs, 'utf8');
    }

    return {
        enums: enums,
        structs: structs,
        tables: tables,
    };
}