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

function parse_sub_struct(
    name: string,
    includes: { [key: string]: JsonFieldStruct },
    obj: {
        enums: { [key: string]: IPathStruct },
        structs: { [key: string]: IPathStruct },
        tables: { [key: string]: IPathStruct }
    }
): JsonFieldStruct {
    let struct = new JsonFieldStruct();

    if (obj.enums.hasOwnProperty(name)) {

        struct.typeStr = name;
        struct.fieldType = FieldType.Enum;
        struct.enumKV = {};
        struct.enumVK = {};

        let rows = CsvUtil.loadDataSync(obj.enums[name].csv);
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
        struct.subStructs = csv_to_struct(obj.structs[name].csv, includes, obj);
        return struct;
    }
    else if (obj.tables.hasOwnProperty(name)) {
        struct.typeStr = name;
        struct.fieldType = FieldType.StructOrTable;
        struct.subStructs = csv_to_table_struct(obj.tables[name].csv, includes, obj);
        return struct;
    }
    else
        throw new Error('未知类型: ' + name);

    return null;
}

function csv_to_struct(
    csv_path: string,
    includes: { [key: string]: JsonFieldStruct },
    obj: {
        enums: { [key: string]: IPathStruct },
        structs: { [key: string]: IPathStruct },
        tables: { [key: string]: IPathStruct }
    }
): JsonFieldStruct[] {

    // console.log('csv_to_struct: ' + csv_path);

    let rows = CsvUtil.loadDataSync(csv_path);

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
                let includeStruct = parse_sub_struct(var_type, includes, obj);
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


function csv_to_table_struct(
    csv_path: string,
    includes: { [key: string]: JsonFieldStruct },
    obj: {
        enums: { [key: string]: IPathStruct },
        structs: { [key: string]: IPathStruct },
        tables: { [key: string]: IPathStruct }
    }
): JsonFieldStruct[] {

    // console.log('csv_to_table_struct: ' + csv_path);

    let rows = CsvUtil.loadDataSync(csv_path);
    let header: string[] = null;
    let data: string[][] = [];
    for (const row of rows) {
        if (row[0].startsWith('#')) {
            // 跳过表头和注释
            continue;
        }
        if (!header) {
            header = row;
        }
        else {
            data.push(row);
        }
    }

    let rowStructs: JsonFieldStruct[] = [];

    // 字段名, 字段类型, 注释
    for (let item of header) {
        if (item.trim() == '')
            continue

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
                let includeStruct = parse_sub_struct(var_type, includes, obj);
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

    return rowStructs;
}

export function parse_json_field_base_type(typeStr: string, str: string): any {
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

export function parse_json_field_enum_type(struct: JsonFieldStruct, str: string): any {
    if (struct.enumKV.hasOwnProperty(str)) {
        return struct.enumKV[str];
    }
    else if (struct.enumVK.hasOwnProperty(parseInt(str))) {
        return parseInt(str);
    }
    else {
        throw new Error('未知枚举值: ' + struct.typeStr + ' - ' + str);
    }
}

export function parse_json_field_struct_or_table_type(struct: JsonFieldStruct, str: string): any {
    let obj: any = {};
    let items = str.split('#');

    if (items.length != struct.subStructs.length) {
        throw new Error('字段数量不匹配: ' + struct.typeStr + ' - ' + str);
    }

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        const [key, value] = parse_json_field(struct.subStructs[i], item);
        obj[key] = value;
    }
    return obj;
}

// key value
export function parse_json_field(struct: JsonFieldStruct, str: string): [string, any] {
    let value: any = null;

    if (struct.fieldType == FieldType.Base) {
        if (struct.isArr) {
            let arr = str.split(';');
            value = [];
            for (const item of arr) {
                value.push(parse_json_field_base_type(struct.typeStr, item));
            }
        }
        else {
            value = parse_json_field_base_type(struct.typeStr, str);
        }
        return [struct.name, value];
    }
    else if (struct.fieldType == FieldType.Enum) {
        if (struct.isArr) {
            let arr = str.split(';');
            value = [];
            for (const item of arr) {
                value.push(parse_json_field_enum_type(struct, item));
            }
        }
        else {
            value = parse_json_field_enum_type(struct, str);
        }
        return [struct.name, value];
    }
    else if (struct.fieldType == FieldType.StructOrTable) {
        if (struct.isArr) {
            let arr = str.split(';');
            value = [];
            for (const item of arr) {
                value.push(parse_json_field_struct_or_table_type(struct, item));
            }
        }
        else {
            value = parse_json_field_struct_or_table_type(struct, str);
        }
        return [struct.name, value];
    }
    else {
        throw new Error('未知类型: ' + struct.typeStr);
    }
}

function get_csv_row_data(csv_path: string): string[][] {
    let rows = CsvUtil.loadDataSync(csv_path);
    let header: string[] = null;
    let data: string[][] = [];
    for (const row of rows) {
        if (row[0].startsWith('#')) {
            // 跳过表头和注释
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

function struct_match_row(struct: JsonFieldStruct[], dataRows: string[][]): any {
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
            const [k, v] = parse_json_field(field, value);
            obj[field.name] = v;
        }
        result.rows.push(obj);
    }
    return result;
}

export function generate_json(obj: {
    enums: { [key: string]: IPathStruct }
    structs: { [key: string]: IPathStruct }
    tables: { [key: string]: IPathStruct }
}): [string, string][] {

    let includes: { [key: string]: JsonFieldStruct } = {};

    const fbs_to_json: [string, string][] = [];

    for (const table in obj.tables) {

        const p = obj.tables[table];
        const csv_path = p.csv;
        const fbs_path = p.fbs;

        let json_path = path.join(path.dirname(fbs_path), path.basename(fbs_path, '.fbs') + '.json');
        json_path = path.join(paths.json, json_path.slice(paths.fbs.length + 1));
        console.log('正在导出表格数据到 JSON ', csv_path, fbs_path, json_path);

        fbs_to_json.push([fbs_path, json_path]);

        const struct = csv_to_table_struct(csv_path, includes, obj);
        const dataRows = get_csv_row_data(csv_path);

        const tableData = struct_match_row(struct, dataRows);

        let json = JSON.stringify(tableData, null, 4);
        fs.mkdirSync(path.dirname(json_path), { recursive: true });
        fs.writeFileSync(json_path, json, 'utf8');
    }

    return fbs_to_json;
}

