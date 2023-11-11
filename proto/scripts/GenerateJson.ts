import path = require("path");
import fs = require("fs");

import { BaseDataTypes } from "./BaseDataTypes";
import { CsvUtil } from "./CsvUtil";
import { IPathStruct, paths } from "./Paths"

enum FieldType {
    Base = 0, // 基础类型
    Enum, // 枚举
    StructOrTable, // 结构体或表
}

class JsonFieldStruct {
    name: string;
    typeStr: string;
    isArr: boolean;
    fieldType: FieldType;

    // 枚举对照
    enumKV: { [key: string]: number };
    enumVK: { [key: number]: string };

    // 当字段为复杂字段时，struct / table 字段列表
    subStructs: JsonFieldStruct[];

    public clone(): JsonFieldStruct {
        const field: JsonFieldStruct = this;
        const f = new JsonFieldStruct();
        f.name = field.name;
        f.typeStr = field.typeStr;
        f.isArr = field.isArr;
        f.fieldType = field.fieldType;
        f.enumKV = field.enumKV ? JSON.parse(JSON.stringify(field.enumKV)) : null;
        f.enumVK = field.enumVK ? JSON.parse(JSON.stringify(field.enumVK)) : null;
        if (field.subStructs) {
            f.subStructs = [];
            for (const sub of field.subStructs) {
                f.subStructs.push(sub.clone());
            }
        }
        return f;
    }
}

async function parseSubStruct(
    name: string,
    includes: { [key: string]: JsonFieldStruct },
    obj: {
        enums: { [key: string]: IPathStruct },
        structs: { [key: string]: IPathStruct },
        tables: { [key: string]: IPathStruct }
    }
): Promise<JsonFieldStruct> {
    let struct = new JsonFieldStruct();

    if (obj.enums.hasOwnProperty(name)) {

        struct.typeStr = name;
        struct.fieldType = FieldType.Enum;
        struct.enumKV = {};
        struct.enumVK = {};

        let rows = await CsvUtil.loadDataSync(obj.enums[name].csv);
        for (const row of rows) {
            if (row[0].startsWith('#')) {
                // 跳过表头和注释
                continue;
            }
            struct.enumKV[row[0]] = parseInt(row[1]);
            struct.enumVK[parseInt(row[1])] = row[0];
        }

        return struct;
    }
    else if (obj.structs.hasOwnProperty(name)) {
        struct.typeStr = name;
        struct.fieldType = FieldType.StructOrTable;
        struct.subStructs = await csv2Struct(obj.structs[name].csv, includes, obj);
        return struct;
    }
    else if (obj.tables.hasOwnProperty(name)) {
        struct.typeStr = name;
        struct.fieldType = FieldType.StructOrTable;
        struct.subStructs = await csv2TableStruct(obj.tables[name].csv, includes, obj);
        return struct;
    }
    else
        throw new Error('未知类型: ' + name);

}

async function csv2Struct(
    csv_path: string,
    includes: { [key: string]: JsonFieldStruct },
    obj: {
        enums: { [key: string]: IPathStruct },
        structs: { [key: string]: IPathStruct },
        tables: { [key: string]: IPathStruct }
    }
): Promise<JsonFieldStruct[]> {

    console.log('csv2Struct: ' + csv_path);

    let rows = await CsvUtil.loadDataSync(csv_path);

    let rowStructs: JsonFieldStruct[] = [];

    // 字段名, 字段类型, 注释 
    for (let row of rows) {
        if (row[0].startsWith('#')) {
            // 跳过表头和注释
            continue;
        }

        let comment = row[2] || '';
        const variable_name = row[0]
        const data_type = row[1]

        let var_type = data_type.trim();

        // 如果是数组类型，取内部类型
        let isArr = false;
        if (var_type.startsWith('[') && var_type.endsWith(']')) {
            var_type = var_type.slice(1, -1);
            isArr = true;
        }

        let fieldStruct: JsonFieldStruct = null;
        if (BaseDataTypes.indexOf(var_type) == -1) {
            // 复杂类型
            if (includes[var_type]) {
                fieldStruct = includes[var_type].clone();
            }
            else {
                let includeStruct = await parseSubStruct(var_type, includes, obj);
                includes[var_type] = includeStruct;
                fieldStruct = includeStruct.clone();
            }

            fieldStruct.name = variable_name;
            fieldStruct.typeStr = var_type;
            fieldStruct.isArr = isArr;
        }
        else {
            // 基础类型
            fieldStruct = new JsonFieldStruct();
            fieldStruct.name = variable_name;
            fieldStruct.typeStr = var_type;
            fieldStruct.isArr = isArr;
            fieldStruct.fieldType = FieldType.Base;
        }

        rowStructs.push(fieldStruct);
    }

    // console.log('csv_to_struct: ' + csv_path + ' end', rowStructs);

    return rowStructs;
}


async function csv2TableStruct(
    csv_path: string,
    includes: { [key: string]: JsonFieldStruct },
    obj: {
        enums: { [key: string]: IPathStruct },
        structs: { [key: string]: IPathStruct },
        tables: { [key: string]: IPathStruct }
    }
): Promise<JsonFieldStruct[]> {

    // console.log('csv_to_table_struct: ' + csv_path);

    let rows = await CsvUtil.loadDataSync(csv_path);
    let header: string[] = null;
    let data: string[][] = [];
    for (const row of rows) {
        if (row[0].startsWith('#')) {
            // 跳过表头和注释
            continue;
        }

        if (row.length <= 0 || (row[0] === '')) {
            // 跳过空行
            continue;
        }

        if (!header) {
            header = row;
        }
        else {
            // console.log('data', row);
            data.push(row);
        }
    }

    let rowStructs: JsonFieldStruct[] = [];

    // 字段名, 字段类型, 注释
    for (let item of header) {
        if (item.trim() == '')
            continue

        if (item.startsWith('#')) {
            // 跳过表头和注释
            continue;
        }

        try {
            const tmp = item.split('|')
            const comment = tmp[0]
            const data = tmp[1]
            const variable = data.split(':')
            const variable_name = variable[0]
            const data_type = variable[1]

            let var_type = data_type.trim();

            // 如果是数组类型，取内部类型
            let isArr = false;
            if (var_type.startsWith('[') && var_type.endsWith(']')) {
                var_type = var_type.slice(1, -1);
                isArr = true;
            }

            let fieldStruct: JsonFieldStruct = null;
            if (BaseDataTypes.indexOf(var_type) == -1) {
                // 复杂类型
                if (includes[var_type]) {
                    fieldStruct = includes[var_type].clone();
                }
                else {
                    let includeStruct = await parseSubStruct(var_type, includes, obj);
                    includes[var_type] = includeStruct;
                    fieldStruct = includeStruct.clone();
                }

                fieldStruct.name = variable_name;
                fieldStruct.typeStr = var_type;
                fieldStruct.isArr = isArr;
            }
            else {
                // 基础类型
                fieldStruct = new JsonFieldStruct();
                fieldStruct.name = variable_name;
                fieldStruct.typeStr = var_type;
                fieldStruct.isArr = isArr;
                fieldStruct.fieldType = FieldType.Base;
            }

            rowStructs.push(fieldStruct);

        } catch (error) {
            console.log('csv_to_table_struct: ' + csv_path + ' error: ' + item);
            throw error;
        }
    }

    return rowStructs;
}

export function parseJsonFieldBaseType(typeStr: string, str: string): any {
    if (typeStr == 'int32' || typeStr == 'int64' || typeStr == 'byte') {
        return parseInt(str);
    }
    else if (typeStr == 'string') {
        return str;
    }
    else if (typeStr == 'bool') {
        return str == 'true';
    }
    else {
        throw new Error('未知类型: ' + typeStr);
    }
}

export function parseJsonFieldEnumType(struct: JsonFieldStruct, str: string): any {
    if (struct.enumKV.hasOwnProperty(str)) {
        return str;
    }
    else if (struct.enumVK.hasOwnProperty(parseInt(str))) {
        return struct.enumVK[parseInt(str)];
    }
    else if (!str || !str.length) {
        return struct.enumVK[0];
    }
    else {
        throw new Error('未知枚举值: ' + struct.typeStr + ' - ' + JSON.stringify(struct.enumKV) + ' - [' + str + ']');
    }
}

export function parseJsonFieldStructType(struct: JsonFieldStruct, str: string): any {

    if (!str || !str.length) return null;

    let obj: any = {};
    let items = str.split('#');

    if (items.length < struct.subStructs.length) {
        throw new Error('字段数量不匹配: ' + struct.typeStr + ' - [' + str + ']');
    }

    for (let i = 0; i < struct.subStructs.length; i++) {
        let item = items[i];
        const { struct_name, type_value } = parseJsonField(struct.subStructs[i], item);
        if (type_value != null)
            obj[struct_name] = type_value;
    }
    return obj;
}

// key value
export function parseJsonField(struct: JsonFieldStruct, str: string): { struct_name: string, type_value: any } {
    let value: any = null;

    if (struct.fieldType == FieldType.Base) {
        if (struct.isArr) {
            if (str == null || str.trim() == '') {
                return { struct_name: struct.name, type_value: [] }
            }
            let arr = str.split(';');
            value = [];
            for (const item of arr) {
                value.push(parseJsonFieldBaseType(struct.typeStr, item));
            }
        }
        else {
            if (str == null || str.trim() == '') {
                switch (struct.typeStr) {
                    case 'bool':
                        return { struct_name: struct.name, type_value: false };
                    case 'string':
                        return { struct_name: struct.name, type_value: '' };
                    case 'int32':
                    case 'int64':
                    case 'byte':
                        return { struct_name: struct.name, type_value: 0 };
                    default:
                        return { struct_name: struct.name, type_value: null };
                }
            }
            value = parseJsonFieldBaseType(struct.typeStr, str);
        }
        return { struct_name: struct.name, type_value: value };
    }
    else if (struct.fieldType == FieldType.Enum) {
        if (struct.isArr) {
            if (str == null || str.trim() == '') {
                return { struct_name: struct.name, type_value: [] };
            }
            let arr = str.split(';');
            value = [];
            for (const item of arr) {
                if (item == null || item.trim() == '') {
                    continue;
                }
                value.push(parseJsonFieldEnumType(struct, item));
            }
        }
        else {
            if (str == null || str.trim() == '') {
                return { struct_name: struct.name, type_value: struct.enumVK[0] };
            }
            value = parseJsonFieldEnumType(struct, str);
        }
        return { struct_name: struct.name, type_value: value };
    }
    else if (struct.fieldType == FieldType.StructOrTable) {
        if (str == null || str.trim() == '') {
            return { struct_name: struct.name, type_value: null };
        }
        if (struct.isArr) {
            let arr = str.split(';');
            value = [];
            for (const item of arr) {
                var o = parseJsonFieldStructType(struct, item)
                o && value.push(o);
            }
        }
        else {
            value = parseJsonFieldStructType(struct, str);
        }
        return { struct_name: struct.name, type_value: value };
    }
    else {
        throw new Error('未知类型: ' + struct.typeStr);
    }
}

async function getCsvRowData(csv_path: string): Promise<string[][]> {
    let rows = await CsvUtil.loadDataSync(csv_path);
    let header: string[] = null;
    let data: string[][] = [];
    for (const row of rows) {
        if (row[0].startsWith('#')) {
            // 跳过表头和注释
            continue;
        }

        if (row.length <= 0 || (row[0] === '')) {
            // 跳过空行
            continue;
        }

        if (!header) {
            header = row;
        }
        else {
            data.push(row);
        }
    }

    return data;
}

function structMatchRow(struct: JsonFieldStruct[], dataRows: string[][]): any {
    let result: {
        rows: any[]
    } = {
        rows: []
    };

    for (const row of dataRows) {
        let obj: any = {};
        for (let i = 0; i < struct.length; i++) {
            const field = struct[i];
            const value = row[i];
            // console.log('正在解析行数据', field.name, value);
            const { struct_name, type_value } = parseJsonField(field, value);
            if (type_value != null)
                obj[struct_name] = type_value;
        }
        result.rows.push(obj);
    }
    return result;
}

export async function generateJson(obj: {
    enums: { [key: string]: IPathStruct }
    structs: { [key: string]: IPathStruct }
    tables: { [key: string]: IPathStruct }
}): Promise<{ fbs_path: string, json_path: string }[]> {

    let includes: { [key: string]: JsonFieldStruct } = {};

    const fbs_to_json: { fbs_path: string, json_path: string }[] = [];

    const split_tables: Map<string, string[]> = new Map();

    for (const table in obj.tables) {

        const p = obj.tables[table];
        const csv_path = p.csv;
        const fbs_path = p.fbs;

        let table_base_name = path.basename(csv_path, 'Table.csv');
        let json_path = path.join(path.dirname(csv_path), table_base_name + '.json');
        json_path = path.join(paths.json, json_path.slice(paths.csv.length + 1));
        console.log('正在导出表格数据到 JSON ', csv_path, fbs_path, json_path);

        if (table_base_name.indexOf('@') > 0) {
            // 拆表待合并
            if (split_tables.has(fbs_path) == false) {
                split_tables.set(fbs_path, []);
            }
            split_tables.get(fbs_path).push(json_path);
        }
        else {
            // 普通表
            fbs_to_json.push({ fbs_path, json_path });
        }

        const struct = await csv2TableStruct(csv_path, includes, obj);
        const dataRows = await getCsvRowData(csv_path);

        const tableData = structMatchRow(struct, dataRows);

        let json = JSON.stringify(tableData, null, 4);
        fs.mkdirSync(path.dirname(json_path), { recursive: true });
        fs.writeFileSync(json_path, json, 'utf8');
    }

    // 合并拆表
    if (split_tables.size > 0) {
        for (const [fbs_path, json_paths] of split_tables) {
            const tableData: { rows: any[] } = { rows: [] };

            // 按 @ 后面的数字排序
            json_paths.sort((a, b) => {
                let na = path.basename(a, '.json');
                let nb = path.basename(b, '.json');
                na = na.slice(na.indexOf('@') + 1);
                nb = nb.slice(nb.indexOf('@') + 1);
                return parseInt(na) - parseInt(nb);
            });

            for (const path of json_paths) {
                console.log('正在合并拆表数据 JSON ', path);
                const data = JSON.parse(fs.readFileSync(path, 'utf8'));
                for (const row of data.rows) {
                    tableData.rows.push(row);
                }
            }
            let json = JSON.stringify(tableData, null, 4);

            let fbs_base_name = path.basename(fbs_path, '.fbs');
            let json_path = path.join(path.dirname(fbs_path), fbs_base_name + '.json');
            json_path = path.join(paths.json, json_path.slice(paths.fbs.length + 1));

            fs.mkdirSync(path.dirname(json_path), { recursive: true });
            fs.writeFileSync(json_path, json, 'utf8');
            fbs_to_json.push({ fbs_path, json_path });
        }
    }

    return fbs_to_json;
}

