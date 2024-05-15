import * as flatbuffers from 'flatbuffers';
export declare class RequestUserEnter implements flatbuffers.IUnpackableObject<RequestUserEnterT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): RequestUserEnter;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: RequestUserEnter): RequestUserEnter;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: RequestUserEnter): RequestUserEnter;
    token(): string | null;
    token(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
    static startRequestUserEnter(builder: flatbuffers.Builder): void;
    static addToken(builder: flatbuffers.Builder, tokenOffset: flatbuffers.Offset): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static create(builder: flatbuffers.Builder, tokenOffset: flatbuffers.Offset): flatbuffers.Offset;
    unpack?(): RequestUserEnterT;
    unpackTo(_o: RequestUserEnterT): void;
}
export declare class RequestUserEnterT implements flatbuffers.IGeneratedObject {
    token: string | Uint8Array | null;
    constructor(token?: string | Uint8Array | null);
    pack?(builder: flatbuffers.Builder): flatbuffers.Offset;
}
