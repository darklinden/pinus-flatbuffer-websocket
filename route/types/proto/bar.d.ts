import * as flatbuffers from 'flatbuffers';
export declare class Bar implements flatbuffers.IUnpackableObject<BarT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): Bar;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: Bar): Bar;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: Bar): Bar;
    bar(): bigint;
    static startBar(builder: flatbuffers.Builder): void;
    static addBar(builder: flatbuffers.Builder, bar: bigint): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static create(builder: flatbuffers.Builder, bar: bigint): flatbuffers.Offset;
    unpack?(): BarT;
    unpackTo(_o: BarT): void;
}
export declare class BarT implements flatbuffers.IGeneratedObject {
    bar: bigint;
    constructor(bar?: bigint);
    pack?(builder: flatbuffers.Builder): flatbuffers.Offset;
}
