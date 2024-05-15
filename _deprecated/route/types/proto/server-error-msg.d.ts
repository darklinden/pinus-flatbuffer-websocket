import * as flatbuffers from 'flatbuffers';
import { ServerErrorMsgRow, ServerErrorMsgRowT } from '../proto/server-error-msg-row.js';
export declare class ServerErrorMsg implements flatbuffers.IUnpackableObject<ServerErrorMsgT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): ServerErrorMsg;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: ServerErrorMsg): ServerErrorMsg;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: ServerErrorMsg): ServerErrorMsg;
    rows(index: number, obj?: ServerErrorMsgRow): ServerErrorMsgRow | null;
    rowsLength(): number;
    static startServerErrorMsg(builder: flatbuffers.Builder): void;
    static addRows(builder: flatbuffers.Builder, rowsOffset: flatbuffers.Offset): void;
    static createRowsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset;
    static startRowsVector(builder: flatbuffers.Builder, numElems: number): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static finishServerErrorMsgBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset): void;
    static finishSizePrefixedServerErrorMsgBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset): void;
    static create(builder: flatbuffers.Builder, rowsOffset: flatbuffers.Offset): flatbuffers.Offset;
    unpack?(): ServerErrorMsgT;
    unpackTo(_o: ServerErrorMsgT): void;
}
export declare class ServerErrorMsgT implements flatbuffers.IGeneratedObject {
    rows: (ServerErrorMsgRowT)[];
    constructor(rows?: (ServerErrorMsgRowT)[]);
    pack?(builder: flatbuffers.Builder): flatbuffers.Offset;
}
