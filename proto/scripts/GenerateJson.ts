import * as path from "path";
import { promises as fs } from "fs";

import { BaseDataType } from "./BaseDataTypes";
import { CsvUtil } from "./CsvUtil";
import { paths } from "./Paths"
import { CsvAll, CsvFileType, FieldType, IComplexField, IComplexType, ICsvObject, IFbsEnum } from "./Initialize";

export function parseEnum(enumInfo: IFbsEnum, enumValue: string): string {

    if (enumInfo.name_list.includes(enumValue)) {
        return enumValue;
    }
    else if (!isNaN(+enumValue)) {
        let value = +enumValue;
        for (const key in enumInfo.value_map) {
            if (enumInfo.value_map[key].value == value) {
                return key;
            }
        }
    }

    throw new Error('未知枚举值: ' + JSON.stringify(enumInfo.value_map) + ' - [' + enumValue + ']');
}

export function parseEnumToValue(enumInfo: IFbsEnum, enumValue: string): any {

    if (enumInfo.name_list.includes(enumValue)) {
        return enumInfo.value_map[enumValue].value;
    }
    else if (!enumValue || !enumValue.length) {
        return 0;
    }
    else {
        throw new Error('未知枚举值: ' + JSON.stringify(enumInfo.value_map) + ' - [' + enumValue + ']');
    }
}

export function parseStruct(complexInfo: IComplexType, value: string, csv_all: CsvAll): any {

    value = value ? value.trim() : '';
    if (!value.length) return null;

    let obj: any = {};
    let items = value.split('#');

    if (items.length != complexInfo.field_list.length) {
        throw new Error('字段数量不匹配: ' + JSON.stringify(complexInfo) + ' - ' + value);
    }

    for (let i = 0; i < complexInfo.field_list.length; i++) {
        let item = items[i];
        const field = complexInfo.field_list[i];
        const result = parseField(field, item, csv_all);
        if (result)
            obj[result.key] = result.typed_value;
    }
    return obj;
}

export function parseBaseType(typeStr: BaseDataType, valueStr: string, csv_all: CsvAll): number | bigint | string | boolean {
    let v = valueStr && valueStr.length ? valueStr.trim() : '';

    switch (typeStr) {
        case 'int64':
        case 'int32':
        case 'byte':
            {
                if (isNaN(+v)) {
                    // try parse enum
                    if (v.includes('::')) {
                        let arr = v.split('::');
                        if (arr.length == 2) {
                            let enumName = arr[0];
                            let enumValue = arr[1];

                            let enum_other = csv_all.get(CsvFileType.Enum, enumName);
                            if (enum_other) {
                                let enumInfo = enum_other.info as IFbsEnum;

                                parseEnumToValue(enumInfo, enumValue);
                            }

                            return +enumValue;
                        }
                    }
                    return 0;
                }

                // isNum
                if (typeStr == 'int64') {
                    let bv = BigInt(v);
                    if (bv > BigInt(Number.MAX_SAFE_INTEGER) || bv < BigInt(Number.MIN_SAFE_INTEGER)) {
                        return bv;
                    }
                    return +v;
                }
                return +v;
            }
        case 'string':
            return v;
        case 'bool':
            return v.toLowerCase() == 'true' || (!isNaN(+v) && +v != 0);
        default:
            throw new Error('未知类型: ' + typeStr);
    }
}

// key value
export function parseField(field: IComplexField, value: string, csv_all: CsvAll): { key: string, typed_value: any } {

    value = value ? value.trim() : '';

    let result: { key: string, typed_value: any } = null;
    switch (field.value_type) {
        case FieldType.Base:
            {
                if (field.is_array) {
                    result = { key: field.field_name, typed_value: [] };
                    if (value != '') {
                        let arr = value.split(';');
                        for (const v of arr) {
                            result.typed_value.push(parseBaseType(field.value_type_name as BaseDataType, v, csv_all));
                        }
                    }
                }
                else {
                    result = { key: field.field_name, typed_value: parseBaseType(field.value_type_name as BaseDataType, value, csv_all) };
                }
            }
            break;
        case FieldType.Enum:
            {
                const enumO = csv_all.get(CsvFileType.Enum, field.value_type_name);
                const enumInfo = enumO.info as IFbsEnum;
                if (field.is_array) {
                    result = { key: field.field_name, typed_value: [] };
                    if (value != '') {
                        let arr = value.split(';');
                        for (const v of arr) {
                            result.typed_value.push(parseEnum(enumInfo, v));
                        }
                    }
                }
                else {
                    result = { key: field.field_name, typed_value: parseEnum(enumInfo, value) };
                }
            }
            break;
        case FieldType.StructOrTable:
            {
                const complexO = csv_all.get(CsvFileType.Struct, field.value_type_name);
                const complexInfo = complexO.info as IComplexType;
                if (field.is_array) {
                    let typed_value = [];
                    let arr = value.split(';');
                    for (const v of arr) {
                        var o = parseStruct(complexInfo, v, csv_all)
                        o && typed_value.push(o);
                    }
                    if (typed_value.length > 0) {
                        result = { key: field.field_name, typed_value: typed_value };
                    }
                }
                else {
                    let typed_value = parseStruct(complexInfo, value, csv_all);
                    if (typed_value) {
                        result = { key: field.field_name, typed_value: typed_value };
                    }
                }
            }
            break;
        case FieldType.Comment:
            break;
        default:
            throw new Error('未知类型: ' + field.value_type);
    }

    return result;
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

async function csvToJson(o: ICsvObject, dataRows: string[][], csv_all: CsvAll) {
    let result: {
        rows: any[]
    } = {
        rows: []
    };

    let info = o.info as IComplexType;

    for (const row of dataRows) {
        let obj: any = {};
        // console.assert(row.length >= info.field_list.length, `字段数量不匹配: ${JSON.stringify(o)} ${JSON.stringify(row)}`);
        for (let i = 0; i < info.field_list.length; i++) {
            const field = info.field_list[i];
            const value = row[i];
            const result = parseField(field, value, csv_all);
            if (result)
                obj[result.key] = result.typed_value;
        }
        result.rows.push(obj);
    }
    return result;
}

export async function generateJson(csv_all: CsvAll): Promise<void> {

    for (const table in csv_all.tables) {
        const t = csv_all.tables[table];
        const split_tables: { [table_name: string]: string[] } = {};

        for (let csv_relative_path of t.csv_relative_paths) {
            let table_base_name = path.basename(csv_relative_path, 'Table.csv');
            let data_relative_path = path.join(path.dirname(csv_relative_path), table_base_name);

            let csv_full_path = path.join(paths.csv, csv_relative_path);
            let json_full_path = path.join(paths.json, data_relative_path + '.json');
            console.log('正在导出表格数据到 JSON ', csv_relative_path, data_relative_path);

            if (!t.data_relative_paths) t.data_relative_paths = [];
            if (table_base_name.indexOf('@') > 0) {
                // 拆表待合并
                console.log('拆表待合并', csv_relative_path);
                let name_path_split = data_relative_path.split('@');
                let table_name = name_path_split[0];
                if (!split_tables[table_name]) split_tables[table_name] = [];
                if (split_tables[table_name].includes(json_full_path) == false) {
                    split_tables[table_name].push(json_full_path);
                }
                data_relative_path = path.join(path.dirname(csv_relative_path), table_name);;
            }

            if (t.data_relative_paths.includes(data_relative_path) == false) {
                t.data_relative_paths.push(data_relative_path);
            }

            const dataRows = await getCsvRowData(csv_full_path);
            const tableData = await csvToJson(t, dataRows, csv_all);

            let json = JSON.stringify(tableData, null, 4);
            await fs.mkdir(path.dirname(json_full_path), { recursive: true });
            await fs.writeFile(json_full_path, json, 'utf8');
        }

        // 合并拆表
        if (Object.keys(split_tables).length > 0) {

            for (const table_name in split_tables) {
                const tableData: { rows: any[] } = { rows: [] };
                const json_list = split_tables[table_name];
                json_list.sort((a, b) => {
                    let na = path.basename(a, '.json');
                    let nb = path.basename(b, '.json');
                    let na_split = na.split('@');
                    let nb_split = nb.split('@');
                    if (na_split.length != 2 || nb_split.length != 2) {
                        throw new Error('拆表文件名错误: ' + a + ', ' + b);
                    }
                    return parseInt(na_split[1]) - parseInt(nb_split[1]);
                });

                console.log('正在合并拆表数据 JSON ', table_name);

                for (const p of json_list) {
                    console.log('正在合并拆表数据 JSON ', p);
                    const data = JSON.parse(await fs.readFile(p, 'utf8'));
                    for (const row of data.rows) {
                        tableData.rows.push(row);
                    }
                }

                let json = JSON.stringify(tableData, null, 4);
                let json_path = path.join(path.dirname(json_list[0]), table_name + '.json');
                console.log('正在导出合并拆表数据 JSON ', json_path);
                await fs.mkdir(path.dirname(json_path), { recursive: true });
                await fs.writeFile(json_path, json, 'utf8');
            }
        }
    }
}

