import * as flatbuffers from 'flatbuffers';
import { MapXDataRow, MapXDataRowT } from '../proto/map-xdata-row.js';
export declare class MapXData implements flatbuffers.IUnpackableObject<MapXDataT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): MapXData;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: MapXData): MapXData;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: MapXData): MapXData;
    rows(index: number, obj?: MapXDataRow): MapXDataRow | null;
    rowsLength(): number;
    static startMapXData(builder: flatbuffers.Builder): void;
    static addRows(builder: flatbuffers.Builder, rowsOffset: flatbuffers.Offset): void;
    static createRowsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
    static startRowsVector(builder: flatbuffers.Builder, numElems: number): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static finishMapXDataBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset): void;
    static finishSizePrefixedMapXDataBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset): void;
    static create(builder: flatbuffers.Builder, rowsOffset: flatbuffers.Offset): flatbuffers.Offset;
    unpack(): MapXDataT;
    unpackTo(_o: MapXDataT): void;
}
export declare class MapXDataT implements flatbuffers.IGeneratedObject {
    rows: (MapXDataRowT)[];
    constructor(rows?: (MapXDataRowT)[]);
    pack(builder: flatbuffers.Builder): flatbuffers.Offset;
}
