import { ByteBuffer } from "./byte-buffer.js";
import { Offset, IGeneratedObject } from "./types.js";
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