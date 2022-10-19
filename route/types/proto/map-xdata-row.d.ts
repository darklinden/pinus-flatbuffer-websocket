import * as flatbuffers from 'flatbuffers';
import { Vec3, Vec3T } from '../proto/vec3.js';
export declare class MapXDataRow implements flatbuffers.IUnpackableObject<MapXDataRowT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): MapXDataRow;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: MapXDataRow): MapXDataRow;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: MapXDataRow): MapXDataRow;
    id(): number;
    name(): string | null;
    name(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
    camp1(index: number, obj?: Vec3): Vec3 | null;
    camp1Length(): number;
    camp2(index: number, obj?: Vec3): Vec3 | null;
    camp2Length(): number;
    static startMapXDataRow(builder: flatbuffers.Builder): void;
    static addId(builder: flatbuffers.Builder, id: number): void;
    static addName(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset): void;
    static addCamp1(builder: flatbuffers.Builder, camp1Offset: flatbuffers.Offset): void;
    static createCamp1Vector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
    static startCamp1Vector(builder: flatbuffers.Builder, numElems: number): void;
    static addCamp2(builder: flatbuffers.Builder, camp2Offset: flatbuffers.Offset): void;
    static createCamp2Vector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
    static startCamp2Vector(builder: flatbuffers.Builder, numElems: number): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static create(builder: flatbuffers.Builder, id: number, nameOffset: flatbuffers.Offset, camp1Offset: flatbuffers.Offset, camp2Offset: flatbuffers.Offset): flatbuffers.Offset;
    unpack(): MapXDataRowT;
    unpackTo(_o: MapXDataRowT): void;
}
export declare class MapXDataRowT implements flatbuffers.IGeneratedObject {
    id: number;
    name: string | Uint8Array | null;
    camp1: (Vec3T)[];
    camp2: (Vec3T)[];
    constructor(id?: number, name?: string | Uint8Array | null, camp1?: (Vec3T)[], camp2?: (Vec3T)[]);
    pack(builder: flatbuffers.Builder): flatbuffers.Offset;
}
