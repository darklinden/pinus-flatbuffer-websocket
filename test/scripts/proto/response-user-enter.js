"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUserEnterT = exports.ResponseUserEnter = void 0;
const flatbuffers = require("../flatbuffers/flatbuffers.js");
const user_info_js_1 = require("./user-info.js");
class ResponseUserEnter {
    constructor() {
        this.bb = null;
        this.bb_pos = 0;
    }
    __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }
    static getRoot(bb, obj) {
        return (obj || new ResponseUserEnter()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new ResponseUserEnter()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    code() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    user(obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new user_info_js_1.UserInfo()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
    }
    static startResponseUserEnter(builder) {
        builder.startObject(2);
    }
    static addCode(builder, code) {
        builder.addFieldInt32(0, code, 0);
    }
    static addUser(builder, userOffset) {
        builder.addFieldOffset(1, userOffset, 0);
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    unpack() {
        return new ResponseUserEnterT(this.code(), (this.user() !== null ? this.user().unpack() : null));
    }
    unpackTo(_o) {
        _o.code = this.code();
        _o.user = (this.user() !== null ? this.user().unpack() : null);
    }
}
exports.ResponseUserEnter = ResponseUserEnter;
class ResponseUserEnterT {
    constructor(code = 0, user = null) {
        this.code = code;
        this.user = user;
    }
    pack(builder) {
        const user = (this.user !== null ? this.user.pack(builder) : 0);
        ResponseUserEnter.startResponseUserEnter(builder);
        ResponseUserEnter.addCode(builder, this.code);
        ResponseUserEnter.addUser(builder, user);
        return ResponseUserEnter.end(builder);
    }
}
exports.ResponseUserEnterT = ResponseUserEnterT;
