import * as flatbuffers from 'flatbuffers';
export declare class Vec3 implements flatbuffers.IUnpackableObject<Vec3T> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): Vec3;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: Vec3): Vec3;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: Vec3): Vec3;
    x(): number;
    y(): number;
    z(): number;
    static startVec3(builder: flatbuffers.Builder): void;
    static addX(builder: flatbuffers.Builder, x: number): void;
    static addY(builder: flatbuffers.Builder, y: number): void;
    static addZ(builder: flatbuffers.Builder, z: number): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static create(builder: flatbuffers.Builder, x: number, y: number, z: number): flatbuffers.Offset;
    unpack?(): Vec3T;
    unpackTo(_o: Vec3T): void;
}
export declare class Vec3T implements flatbuffers.IGeneratedObject {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    pack?(builder: flatbuffers.Builder): flatbuffers.Offset;
}
