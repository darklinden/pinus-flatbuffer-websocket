export declare class Builder {
    private bb;
    private space;
    private minalign;
    private vtable;
    private vtable_in_use;
    private isNested;
    private object_start;
    private vtables;
    private vector_num_elems;
    private force_defaults;
    private string_maps;
    private text_encoder;
    constructor(opt_initial_size?: number);
    clear(): void;
    forceDefaults(forceDefaults: boolean): void;
    dataBuffer(): ByteBuffer;
    asUint8Array(): Uint8Array;
    prep(size: number, additional_bytes: number): void;
    pad(byte_size: number): void;
    writeInt8(value: number): void;
    writeInt16(value: number): void;
    writeInt32(value: number): void;
    writeInt64(value: bigint): void;
    writeFloat32(value: number): void;
    writeFloat64(value: number): void;
    addInt8(value: number): void;
    addInt16(value: number): void;
    addInt32(value: number): void;
    addInt64(value: bigint): void;
    addFloat32(value: number): void;
    addFloat64(value: number): void;
    addFieldInt8(voffset: number, value: number, defaultValue: number): void;
    addFieldInt16(voffset: number, value: number, defaultValue: number): void;
    addFieldInt32(voffset: number, value: number, defaultValue: number): void;
    addFieldInt64(voffset: number, value: bigint, defaultValue: bigint): void;
    addFieldFloat32(voffset: number, value: number, defaultValue: number): void;
    addFieldFloat64(voffset: number, value: number, defaultValue: number): void;
    addFieldOffset(voffset: number, value: Offset, defaultValue: Offset): void;
    addFieldStruct(voffset: number, value: Offset, defaultValue: Offset): void;
    nested(obj: Offset): void;
    notNested(): void;
    slot(voffset: number): void;
    offset(): Offset;
    static growByteBuffer(bb: ByteBuffer): ByteBuffer;
    addOffset(offset: Offset): void;
    startObject(numfields: number): void;
    endObject(): Offset;
    finish(root_table: Offset, opt_file_identifier?: string, opt_size_prefix?: boolean): void;
    finishSizePrefixed(this: Builder, root_table: Offset, opt_file_identifier?: string): void;
    requiredField(table: Offset, field: number): void;
    startVector(elem_size: number, num_elems: number, alignment: number): void;
    endVector(): Offset;
    createSharedString(s: string | Uint8Array): Offset;
    createString(s: string | Uint8Array | null | undefined): Offset;
    createObjectOffset(obj: string | IGeneratedObject | null): Offset;
    createObjectOffsetList(list: (string | IGeneratedObject)[]): Offset[];
    createStructOffsetList(list: (string | IGeneratedObject)[], startFunc: (builder: Builder, length: number) => void): Offset;
}

export declare class ByteBuffer {
    private bytes_;
    private position_;
    private text_decoder_;
    constructor(bytes_: Uint8Array);
    static allocate(byte_size: number): ByteBuffer;
    clear(): void;
    bytes(): Uint8Array;
    position(): number;
    setPosition(position: number): void;
    capacity(): number;
    readInt8(offset: number): number;
    readUint8(offset: number): number;
    readInt16(offset: number): number;
    readUint16(offset: number): number;
    readInt32(offset: number): number;
    readUint32(offset: number): number;
    readInt64(offset: number): bigint;
    readUint64(offset: number): bigint;
    readFloat32(offset: number): number;
    readFloat64(offset: number): number;
    writeInt8(offset: number, value: number): void;
    writeUint8(offset: number, value: number): void;
    writeInt16(offset: number, value: number): void;
    writeUint16(offset: number, value: number): void;
    writeInt32(offset: number, value: number): void;
    writeUint32(offset: number, value: number): void;
    writeInt64(offset: number, value: bigint): void;
    writeUint64(offset: number, value: bigint): void;
    writeFloat32(offset: number, value: number): void;
    writeFloat64(offset: number, value: number): void;
    getBufferIdentifier(): string;
    __offset(bb_pos: number, vtable_offset: number): Offset;
    __union(t: Table, offset: number): Table;
    __string(offset: number, opt_encoding?: Encoding): string | Uint8Array;
    __union_with_string(o: Table | string, offset: number): Table | string;
    __indirect(offset: Offset): Offset;
    __vector(offset: Offset): Offset;
    __vector_len(offset: Offset): Offset;
    __has_identifier(ident: string): boolean;
    createScalarList<T>(listAccessor: (i: number) => T | null, listLength: number): T[];
    createObjList<T1 extends IUnpackableObject<T2>, T2 extends IGeneratedObject>(listAccessor: (i: number) => T1 | null, listLength: number): T2[];
}

export declare const SIZEOF_SHORT = 2;
export declare const SIZEOF_INT = 4;
export declare const FILE_IDENTIFIER_LENGTH = 4;
export declare const SIZE_PREFIX_LENGTH = 4;

export declare enum Encoding {
    UTF8_BYTES = 1,
    UTF16_STRING = 2
}

export { SIZEOF_SHORT } from './constants.js';
export { SIZEOF_INT } from './constants.js';
export { FILE_IDENTIFIER_LENGTH } from './constants.js';
export { SIZE_PREFIX_LENGTH } from './constants.js';
export { Table, Offset, IGeneratedObject, IUnpackableObject } from './types.js';
export { int32, float32, float64, isLittleEndian } from './utils.js';
export { Encoding } from './encoding.js';
export { Builder } from './builder.js';
export { ByteBuffer } from './byte-buffer.js';

export { toReference } from './flexbuffers/reference.js';
export declare function builder(): Builder;
export declare function toObject(buffer: ArrayBuffer): unknown;
export declare function encode(object: unknown, size?: number, deduplicateStrings?: boolean, deduplicateKeys?: boolean, deduplicateKeyVectors?: boolean): Uint8Array;

export type Offset = number;
export type Table = {
    bb: ByteBuffer;
    bb_pos: number;
};
export interface IGeneratedObject {
    pack?(builder: Builder): Offset;
}
export interface IUnpackableObject<T> {
    unpack?(): T;
}

export declare const int32: Int32Array;
export declare const float32: Float32Array;
export declare const float64: Float64Array;
export declare const isLittleEndian: boolean;
