import { ValueType } from './value-type.js';
export declare function toReference(buffer: ArrayBuffer): Reference;
export declare class Reference {
    private dataView;
    private offset;
    private parentWidth;
    private packedType;
    private path;
    private readonly byteWidth;
    private readonly valueType;
    private _length;
    constructor(dataView: DataView, offset: number, parentWidth: number, packedType: ValueType, path: string);
    isNull(): boolean;
    isNumber(): boolean;
    isFloat(): boolean;
    isInt(): boolean;
    isString(): boolean;
    isBool(): boolean;
    isBlob(): boolean;
    isVector(): boolean;
    isMap(): boolean;
    boolValue(): boolean | null;
    intValue(): number | bigint | null;
    floatValue(): number | null;
    numericValue(): number | bigint | null;
    stringValue(): string | null;
    blobValue(): Uint8Array | null;
    get(key: number): Reference;
    length(): number;
    toObject(): unknown;
}
