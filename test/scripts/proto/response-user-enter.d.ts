import * as flatbuffers from '../flatbuffers/flatbuffers.js';
import { UserInfo, UserInfoT } from './user-info.js';
export declare class ResponseUserEnter implements flatbuffers.IUnpackableObject<ResponseUserEnterT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): ResponseUserEnter;
    static getRoot(bb: flatbuffers.ByteBuffer, obj?: ResponseUserEnter): ResponseUserEnter;
    static getSizePrefixedRoot(bb: flatbuffers.ByteBuffer, obj?: ResponseUserEnter): ResponseUserEnter;
    code(): number;
    user(obj?: UserInfo): UserInfo | null;
    static startResponseUserEnter(builder: flatbuffers.Builder): void;
    static addCode(builder: flatbuffers.Builder, code: number): void;
    static addUser(builder: flatbuffers.Builder, userOffset: flatbuffers.Offset): void;
    static end(builder: flatbuffers.Builder): flatbuffers.Offset;
    unpack?(): ResponseUserEnterT;
    unpackTo(_o: ResponseUserEnterT): void;
}
export declare class ResponseUserEnterT implements flatbuffers.IGeneratedObject {
    code: number;
    user: UserInfoT | null;
    constructor(code?: number, user?: UserInfoT | null);
    pack?(builder: flatbuffers.Builder): flatbuffers.Offset;
}
