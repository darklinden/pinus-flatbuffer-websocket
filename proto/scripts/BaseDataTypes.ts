export type BaseDataType = 'bool' | 'string' | 'int32' | 'int64' | 'byte';

export function isBaseType(typeStr: string): boolean {
    return typeStr == 'bool'
        || typeStr == 'string'
        || typeStr == 'int32'
        || typeStr == 'int64'
        || typeStr == 'byte';
}