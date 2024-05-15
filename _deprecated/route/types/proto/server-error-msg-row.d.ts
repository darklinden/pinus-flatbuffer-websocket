import * as flatbuffers from 'flatbuffers';
import { ServerErrorType } from '../proto/server-error-type.js';
export declare class ServerErrorMsgRow implements flatbuffers.IUnpackableObject<ServerErrorMsgRowT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): ServerErrorMsgRow;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: ServerErrorMsgRow): ServerErrorMsgRow;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: ServerErrorMsgRow): ServerErrorMsgRow;
    errCode(): ServerErrorType;
    errMsg(): string | null;
    errMsg(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
    static startServerErrorMsgRow(builder: flatbuffers.Builder): void;
    static addErrCode(builder: flatbuffers.Builder, errCode: ServerErrorType): void;
    static addErrMsg(builder: flatbuffers.Builder, errMsgOffset: flatbuffers.Offset): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static create(builder: flatbuffers.Builder, errCode: ServerErrorType, errMsgOffset: flatbuffers.Offset): flatbuffers.Offset;
    unpack?(): ServerErrorMsgRowT;
    unpackTo(_o: ServerErrorMsgRowT): void;
}
export declare class ServerErrorMsgRowT implements flatbuffers.IGeneratedObject {
    errCode: ServerErrorType;
    errMsg: string | Uint8Array | null;
    constructor(errCode?: ServerErrorType, errMsg?: string | Uint8Array | null);
    pack?(builder: flatbuffers.Builder): flatbuffers.Offset;
}
