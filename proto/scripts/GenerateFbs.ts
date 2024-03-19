import { promises as fs } from 'fs';
import * as path from "path";
import { paths } from "./Paths"
import { CsvAll, CsvFileType, FieldType, IComplexType, ICsvObject, IFbsEnum } from './Initialize';

async function saveFbs(o: ICsvObject, csv_all: CsvAll): Promise<void> {

    console.log('生成 fbs 文件', o.class_relative_path);

    switch (o.info.type) {
        case CsvFileType.Enum:
            {
                let enum_info = o.info as IFbsEnum;
                let enum_fbs = "namespace Proto;\n\n";
                enum_fbs += `enum ${o.class_name} : ${enum_info.value_type} {\n`;
                for (let key of enum_info.name_list) {
                    let value = enum_info.value_map[key];
                    if (value.comment && value.comment.length > 0) {
                        enum_fbs += `    ${key} = ${value.value}, // ${value.comment} \n`;
                    }
                    else {
                        enum_fbs += `    ${key} = ${value.value}, \n`;
                    }
                }
                enum_fbs += '}\n';

                let write_to_path = path.join(paths.fbs, o.class_relative_path + '.fbs');
                await fs.mkdir(path.dirname(write_to_path), { recursive: true });
                await fs.writeFile(write_to_path, enum_fbs, 'utf8');
            }
            break;
        case CsvFileType.Struct:
            {
                let struct_info = o.info as IComplexType;
                const fbs_dir = path.dirname(o.class_relative_path);
                let struct_fbs = '';
                if (struct_info.include_list.length > 0) {
                    for (let include of struct_info.include_list) {
                        const include_one = csv_all.get_by_name(include);
                        let include_relative_path = path.join(path.relative(fbs_dir, path.dirname(include_one.class_relative_path)), include_one.class_name);
                        if (process.platform == 'win32' || process.platform == 'cygwin') {
                            // windows
                            include_relative_path = include_relative_path.replace('\\', '/');
                        }
                        struct_fbs += `include "${include_relative_path}.fbs";\n`;
                    }
                    struct_fbs += '\n';
                }

                struct_fbs += "namespace Proto;\n\n";
                struct_fbs += `table ${o.class_name} {\n`;

                for (let field of struct_info.field_list) {
                    struct_fbs += `    ${field.field_name}: `;
                    if (field.is_array) {
                        struct_fbs += `[${field.value_type_name}]; `;
                    }
                    else {
                        struct_fbs += `${field.value_type_name}; `;
                    }

                    if (field.comment && field.comment.length > 0) {
                        struct_fbs += `// ${field.comment} \n`;
                    }
                    else {
                        struct_fbs += `\n`;
                    }
                }
                struct_fbs += '}\n';

                let write_to_path = path.join(paths.fbs, o.class_relative_path + '.fbs');
                await fs.mkdir(path.dirname(write_to_path), { recursive: true });
                await fs.writeFile(write_to_path, struct_fbs, 'utf8');
            }
            break;
        case CsvFileType.Table:
            {
                let table_info = o.info as IComplexType;
                const fbs_dir = path.dirname(o.class_relative_path);
                let table_fbs = '';
                if (table_info.include_list.length > 0) {
                    for (let include of table_info.include_list) {
                        const include_one = csv_all.get_by_name(include);
                        let include_relative_path = path.join(path.relative(fbs_dir, path.dirname(include_one.class_relative_path)), include_one.class_name);
                        if (process.platform == 'win32' || process.platform == 'cygwin') {
                            // windows
                            include_relative_path = include_relative_path.replace('\\', '/');
                        }
                        table_fbs += `include "${include_relative_path}.fbs";\n`;
                    }
                    table_fbs += '\n';
                }

                table_fbs += "namespace Proto;\n\n";
                table_fbs += `table ${o.class_name}Row {\n`;
                for (let field of table_info.field_list) {
                    if (field.value_type == FieldType.Comment) continue;
                    table_fbs += `    ${field.field_name}: `;
                    if (field.is_array) {
                        table_fbs += `[${field.value_type_name}]; `;
                    }
                    else {
                        table_fbs += `${field.value_type_name}; `;
                    }
                    if (field.comment && field.comment.length > 0) {
                        table_fbs += `// ${field.comment} \n`;
                    }
                    else {
                        table_fbs += `\n`;
                    }
                }
                table_fbs += '}\n';

                table_fbs += `table ${o.class_name} {\n`;
                table_fbs += `    rows:[${o.class_name}Row];\n`;
                table_fbs += '}\n';

                table_fbs += `root_type ${o.class_name};\n`;

                let write_to_path = path.join(paths.fbs, o.class_relative_path + '.fbs');
                await fs.mkdir(path.dirname(write_to_path), { recursive: true });
                await fs.writeFile(write_to_path, table_fbs, 'utf8');
            }
            break;
        default:
            throw new Error(`未知类型 ${o.info.type}`);
    }
}

export async function generateFbs(csv_all: CsvAll): Promise<void> {

    // 生成枚举 fbs
    for (const key in csv_all.enums) {
        const o = csv_all.enums[key];
        await saveFbs(o, csv_all);
    }

    // 生成结构体 fbs
    for (const key in csv_all.structs) {
        const o = csv_all.structs[key];
        await saveFbs(o, csv_all);
    }

    // 生成表 fbs
    for (const key in csv_all.tables) {
        const o = csv_all.tables[key];
        await saveFbs(o, csv_all);
    }
}