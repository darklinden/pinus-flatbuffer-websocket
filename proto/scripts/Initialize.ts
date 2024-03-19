import { promises as fs } from "fs";
import * as path from "path";

import { paths } from "./Paths"
import { fileExist, walkDir } from "../tools/FileUtil";
import { CsvUtil } from "./CsvUtil";
import { isBaseType } from "./BaseDataTypes";

async function initPaths() {
    const root = path.resolve(__dirname, "..");
    const flatc_folder = path.join(root, 'flatc');
    switch (process.platform) {
        // windows
        case 'win32':
        case 'cygwin':
            paths.flatc = path.join(flatc_folder, 'flatc.exe');
            break;
        // mac
        case 'darwin':
            paths.flatc = path.join(flatc_folder, 'flatc-darwin-intel');
            break;
        // linux
        default:
            paths.flatc = path.join(flatc_folder, 'flatc-linux');
            break;
    }

    // csv 源文件路径
    paths.csv = path.join(root, 'csv');

    // 生成的 fbs 文件路径
    paths.other_fbs = path.join(root, 'fbs');

    // 生成文件路径 重建以清理
    const generated_folder = path.join(root, 'generated')

    if (await fileExist(generated_folder)) {
        console.log('清理生成文件夹');
        await fs.rm(generated_folder, { recursive: true, force: true });
    }

    await fs.mkdir(generated_folder, { recursive: true });

    // 生成的 flatbuffers 文件路径
    paths.fbs = path.join(generated_folder, 'fbs');
    await fs.mkdir(paths.fbs, { recursive: true });

    // 生成的 ts 文件路径
    paths.ts = path.join(generated_folder, 'ts');
    await fs.mkdir(paths.ts, { recursive: true });

    // 生成的 rust 文件路径
    paths.rust = path.join(generated_folder, 'rust');
    await fs.mkdir(paths.rust, { recursive: true });

    // 生成的 csharp 文件路径
    paths.csharp = path.join(generated_folder, 'csharp');
    await fs.mkdir(paths.csharp, { recursive: true });

    // 生成的 json 文件路径
    paths.json = path.join(generated_folder, 'json');
    await fs.mkdir(paths.json, { recursive: true });

    // 生成的 bytes 文件路径
    paths.bytes = path.join(generated_folder, 'bytes');
    await fs.mkdir(paths.bytes, { recursive: true });

    // 生成的测试文件路径
    paths.tests = path.join(generated_folder, 'tests');
    await fs.mkdir(paths.tests, { recursive: true });
}

// csv 文件类型
export enum CsvFileType {
    Unknown,
    Enum,
    Struct,
    Table,
}

// 字段数据类型
export enum FieldType {
    Base = 0, // 基础类型
    Enum, // 枚举
    StructOrTable, // 结构体或表
    Comment, // 注释
}

// csv 对象
export interface ICsvObject {
    class_name: string;
    csv_relative_paths: string[];
    class_relative_path: string;
    info?: IFbsInfo;
    data_relative_paths?: string[];
}

export interface IFbsInfo {
    type: CsvFileType;
}

// 枚举类型
export interface IFbsEnum extends IFbsInfo {
    value_type: string;
    name_list: string[]; // sorted key list 
    value_map: {
        [key: string]: {
            value: number;
            comment: string;
        }
    } // key -> value & comment
}

// 复杂类型
export interface IComplexField {
    // key
    field_name: string; // field name

    // value type
    value_type_name: string; // name
    value_type: FieldType; // type 
    is_array: boolean;
    comment: string;
}

export interface IComplexType extends IFbsInfo {
    include_list: string[]; // type name list
    field_list: IComplexField[]; // field list
}

export class CsvAll {
    enums: { [key: string]: ICsvObject };
    structs: { [key: string]: ICsvObject };
    tables: { [key: string]: ICsvObject };

    constructor() {
        this.enums = {};
        this.structs = {};
        this.tables = {};
    }

    get(t: CsvFileType, key: string): ICsvObject {
        switch (t) {
            case CsvFileType.Enum:
                return this.enums[key];
            case CsvFileType.Struct:
                return this.structs[key];
            case CsvFileType.Table:
                return this.tables[key];
            default:
                throw new Error(`未知的 csv 类型: ${t}`);
        }
    }

    get_by_name(name: string): ICsvObject {
        let obj = this.enums[name];
        if (obj) return obj;

        obj = this.structs[name];
        if (obj) return obj;

        obj = this.tables[name];
        if (obj) return obj;

        return undefined;
    }

    set(t: CsvFileType, value: ICsvObject) {
        switch (t) {
            case CsvFileType.Enum:
                this.enums[value.class_name] = value;
                break;
            case CsvFileType.Struct:
                this.structs[value.class_name] = value;
                break;
            case CsvFileType.Table:
                this.tables[value.class_name] = value;
                break;
            default:
                throw new Error(`未知的 csv 类型: ${t}`);
        }
    }
}

async function prepareCsvs(): Promise<CsvAll> {
    console.log('----------------------------------------');
    console.log('读取并处理 csv 文件');
    const csv_files = await walkDir(paths.csv, '.csv');
    const csv_all = new CsvAll();

    const fbs_all_name_list: string[] = [];
    for (const csv_relative_path of csv_files) {
        const csv_full_path = path.join(paths.csv, csv_relative_path);
        const csv_file_name = path.basename(csv_full_path);

        // 忽略正在编辑时的临时文件
        if (csv_file_name.startsWith('~$'))
            continue

        // 忽略注释文件
        if (csv_file_name.startsWith('#'))
            continue

        // 忽略不是枚举、结构体、表的文件
        if (csv_file_name.endsWith('Enum.csv') == false
            && csv_file_name.endsWith('Struct.csv') == false
            && csv_file_name.endsWith('Table.csv') == false) {
            throw new Error(`仅支持文件名末尾标注 Enum Struct Table, 未知的 csv 文件: ${csv_full_path}`);
        }

        let class_name = csv_file_name.split('.')[0];
        let csv_type = CsvFileType.Unknown;
        let class_reuse = false;
        let table_split = false;

        // SomeThingEnum.csv -> SomeThing.fbs
        if (class_name.endsWith('Enum')) {
            class_name = class_name.slice(0, -4);
            csv_type = CsvFileType.Enum;
        }
        // SomeThingStruct.csv -> SomeThing.fbs
        else if (class_name.endsWith('Struct')) {
            class_name = class_name.slice(0, -6);
            csv_type = CsvFileType.Struct;
        }
        // SomeThingTable.csv -> SomeThing.fbs
        else if (class_name.endsWith('Table')) {
            class_name = class_name.slice(0, -5);
            csv_type = CsvFileType.Table;

            // 检查拆表
            if (class_name.indexOf('@') != -1) {
                class_name = class_name.split('@')[0];
                table_split = true;
            }

            // 检查复用类
            const content = await fs.readFile(csv_full_path, 'utf-8');
            const lines = content.split('\n');
            if (lines[0].startsWith('#class')) {
                class_name = lines[0].split(' ')[1];
                class_name = class_name.trim();
                class_reuse = true;
            }
        }

        let relative_folder = path.dirname(csv_relative_path);
        let class_relative_path = path.join(relative_folder, class_name);
        if (process.platform == 'win32' || process.platform == 'cygwin') {
            // windows
            class_relative_path = class_relative_path.replace('\\', '/');
        }

        let csv_obj: ICsvObject;
        if (class_reuse || table_split) {
            csv_obj = csv_all.get(csv_type, class_name);
        }
        else {
            // 如果类型名重复，且不是拆表或复用类，报错
            if (fbs_all_name_list.indexOf(class_name) != -1)
                throw new Error(`重复的结构体名: ${class_name}`);
            fbs_all_name_list.push(class_name);
        }

        if (!csv_obj) {
            csv_obj = {
                class_name: class_name,
                csv_relative_paths: [],
                class_relative_path: class_relative_path,
                info: { type: csv_type },
            };
        }

        csv_obj.csv_relative_paths.push(csv_relative_path);
        csv_all.set(csv_type, csv_obj);
    }

    return csv_all;
}

async function prepareEnums(csv_all: CsvAll) {
    const enums = csv_all.enums;
    for (const key in enums) {
        const csv_obj = enums[key];

        const fbs_enum: IFbsEnum = {
            type: CsvFileType.Enum,
            value_type: 'byte',
            name_list: [],
            value_map: {},
        };

        const csv_content = await CsvUtil.loadDataSync(path.join(paths.csv, csv_obj.csv_relative_paths[0]));
        if (csv_content == null) {
            throw new Error(`读取 csv 文件失败: ${csv_obj.csv_relative_paths[0]}`);
        }

        fbs_enum.value_type = 'byte';
        if (csv_content[0][0].startsWith('#int') || csv_content[0][0].startsWith('# int')) {
            fbs_enum.value_type = 'int32';
        }

        for (let row of csv_content) {
            if (row[0].startsWith('#')) {
                // 跳过表头和注释
                continue;
            }

            if (row.length <= 0 || (row.length > 0 && row[0].trim().length == 0)) {
                // 跳过空行
                continue;
            }

            // row[0] -> key row[1] -> value row[2] -> comment
            fbs_enum.name_list.push(row[0]);
            fbs_enum.value_map[row[0]] = {
                value: parseInt(row[1]),
                comment: row[2] || '',
            };
        }

        csv_obj.info = fbs_enum;
    }
}

async function prepareStructs(csv_all: CsvAll) {
    const structs: ICsvObject[] = [];
    for (const key in csv_all.structs) {
        const value = csv_all.structs[key];
        structs.push(value);
    }

    for (const csv_obj of structs) {

        const csv_content = await CsvUtil.loadDataSync(path.join(paths.csv, csv_obj.csv_relative_paths[0]));
        if (csv_content == null) {
            throw new Error(`读取 csv 文件失败: ${csv_obj.csv_relative_paths[0]}`);
        }

        let fbs_complex: IComplexType = {
            type: CsvFileType.Struct,
            include_list: [],
            field_list: [],
        }

        for (let row of csv_content) {

            if (row[0].startsWith('#')) {
                // 跳过表头和注释
                continue;
            }

            if (row.length <= 0 || (row.length > 0 && row[0].trim().length == 0)) {
                // 跳过空行
                continue;
            }

            const variable_name = row[0];
            const data_type = row[1];
            const comment = row[2] || '';

            let var_type = data_type.trim();

            // 如果是数组类型，取内部类型
            let isArr = false;
            if (var_type.startsWith('[') && var_type.endsWith(']')) {
                var_type = var_type.slice(1, -1);
                isArr = true;
            }

            if (isBaseType(var_type)) {
                // 基础类型
                fbs_complex.field_list.push({
                    field_name: variable_name,
                    value_type_name: var_type,
                    value_type: FieldType.Base,
                    is_array: isArr,
                    comment: comment,
                });
            }
            else {

                const field_include = csv_all.get_by_name(var_type);

                // 复杂类型
                if (fbs_complex.include_list.includes(var_type) == false) {
                    fbs_complex.include_list.push(var_type);
                }

                switch (field_include.info.type) {
                    case CsvFileType.Enum: {
                        fbs_complex.field_list.push({
                            field_name: variable_name,
                            value_type_name: var_type,
                            value_type: FieldType.Enum,
                            is_array: isArr,
                            comment: comment,
                        });
                    }
                        break;
                    case CsvFileType.Struct: {
                        fbs_complex.field_list.push({
                            field_name: variable_name,
                            value_type_name: var_type,
                            value_type: FieldType.StructOrTable,
                            is_array: isArr,
                            comment: comment,
                        });
                    }
                        break;
                    case CsvFileType.Table:
                        throw new Error(`不支持的类型: ${var_type}`);
                }
            }

            csv_obj.info = fbs_complex;
        }
    }
}

async function prepareTables(csv_all: CsvAll) {
    const tables: ICsvObject[] = [];
    for (const key in csv_all.tables) {
        const value = csv_all.tables[key];
        tables.push(value);
    }

    for (const csv_obj of tables) {

        const csv_content = await CsvUtil.loadDataSync(path.join(paths.csv, csv_obj.csv_relative_paths[0]));
        if (csv_content == null) {
            throw new Error(`读取 csv 文件失败: ${csv_obj.csv_relative_paths[0]}`);
        }

        let fbs_complex: IComplexType = {
            type: CsvFileType.Table,
            include_list: [],
            field_list: [],
        }

        let header: string[] = null;
        for (let row of csv_content) {
            if (row[0].startsWith('#')) {
                // 跳过表头和注释
                continue;
            }

            if (row.length <= 0 || (row.length > 0 && row[0].trim().length == 0)) {
                // 跳过空行
                continue;
            }

            if (!header) {
                header = row;
                break;
            }
        }

        if (!header) {
            throw new Error(`表头为空: ${csv_obj.csv_relative_paths[0]}`);
        }

        // 字段名, 字段类型, 注释
        let header_ended = false;
        for (let i = 0; i < header.length; i++) {
            let item = header[i];
            item = item ? item.trim() : '';

            if (item == '') {
                if (!header_ended) {
                    header_ended = true;
                }
                continue;
            }
            else {
                if (header_ended) {
                    throw new Error(`表头格式错误: ${csv_obj.csv_relative_paths[0]}`);
                }
            }

            if (item.startsWith('#')) {
                // 注释
                fbs_complex.field_list.push({
                    field_name: '',
                    value_type_name: '',
                    value_type: FieldType.Comment,
                    is_array: false,
                    comment: item,
                });
                continue;
            }

            try {
                const comment_and_data = item.split('|');
                const comment = comment_and_data[0];
                const data = comment_and_data[1];
                const variable = data.split(':');
                const variable_name = variable[0];
                const data_type = variable[1];

                let var_type = data_type.trim();

                // 如果是数组类型，取内部类型
                let isArr = false;
                if (var_type.startsWith('[') && var_type.endsWith(']')) {
                    var_type = var_type.slice(1, -1);
                    isArr = true;
                }

                if (isBaseType(var_type)) {
                    // 基础类型
                    fbs_complex.field_list.push({
                        field_name: variable_name,
                        value_type_name: var_type,
                        value_type: FieldType.Base,
                        is_array: isArr,
                        comment: comment,
                    });
                }
                else {

                    const field_include = csv_all.get_by_name(var_type);

                    // 复杂类型
                    if (fbs_complex.include_list.includes(var_type) == false) {
                        fbs_complex.include_list.push(var_type);
                    }

                    switch (field_include.info.type) {
                        case CsvFileType.Enum: {
                            fbs_complex.field_list.push({
                                field_name: variable_name,
                                value_type_name: var_type,
                                value_type: FieldType.Enum,
                                is_array: isArr,
                                comment: comment,
                            });
                        }
                            break;
                        case CsvFileType.Struct: {
                            fbs_complex.field_list.push({
                                field_name: variable_name,
                                value_type_name: var_type,
                                value_type: FieldType.StructOrTable,
                                is_array: isArr,
                                comment: comment,
                            });
                        }
                            break;
                        case CsvFileType.Table:
                            throw new Error(`不支持的类型: ${var_type}`);
                    }
                }
            }
            catch (e) {
                throw new Error(`解析表头失败: ${csv_obj.csv_relative_paths[0]}: ${e}`);
            }
        }

        csv_obj.info = fbs_complex;
    }
}

async function prepareTypes(csv_all: CsvAll) {
    console.log('----------------------------------------');
    console.log('预处理结构类型');
    await prepareEnums(csv_all);
    await prepareStructs(csv_all);
    await prepareTables(csv_all);
}

export async function Initialize(): Promise<CsvAll> {

    // 修复BigInt序列化的问题
    // @ts-ignore
    BigInt.prototype.toJSON = function () { return this.toString() };

    await initPaths();
    const csv_all = await prepareCsvs();
    await prepareTypes(csv_all);
    // console.log('csvs:', JSON.stringify(csv_all, null, 2));
    return csv_all;
}
