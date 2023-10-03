import * as flatbuffers from 'flatbuffers';
export declare class UserInfo implements flatbuffers.IUnpackableObject<UserInfoT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): UserInfo;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: UserInfo): UserInfo;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: UserInfo): UserInfo;
    name(): string | null;
    name(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
    level(): number;
    static startUserInfo(builder: flatbuffers.Builder): void;
    static addName(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset): void;
    static addLevel(builder: flatbuffers.Builder, level: number): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    static create(builder: flatbuffers.Builder, nameOffset: flatbuffers.Offset, level: number): flatbuffers.Offset;
    unpack?(): UserInfoT;
    unpackTo(_o: UserInfoT): void;
}
export declare class UserInfoT implements flatbuffers.IGeneratedObject {
    name: string | Uint8Array | null;
    level: number;
    constructor(name?: string | Uint8Array | null, level?: number);
    pack?(builder: flatbuffers.Builder): flatbuffers.Offset;
}
