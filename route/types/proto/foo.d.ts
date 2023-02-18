import * as flatbuffers from 'flatbuffers';
export declare class Foo implements flatbuffers.IUnpackableObject<FooT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): Foo;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: Foo): Foo;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: Foo): Foo;
    foo(): bigint;
    static startFoo(builder: flatbuffers.Builder): void;
    static addFoo(builder: flatbuffers.Builder, foo: bigint): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static create(builder: flatbuffers.Builder, foo: bigint): flatbuffers.Offset;
    unpack?(): FooT;
    unpackTo(_o: FooT): void;
}
export declare class FooT implements flatbuffers.IGeneratedObject {
    foo: bigint;
    constructor(foo?: bigint);
    pack?(builder: flatbuffers.Builder): flatbuffers.Offset;
}
