"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestUserEnterT = exports.RequestUserEnter = void 0;
const flatbuffers = require("flatbuffers");
class RequestUserEnter {
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
        return (obj || new RequestUserEnter()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new RequestUserEnter()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    token(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startRequestUserEnter(builder) {
        builder.startObject(1);
    }
    static addToken(builder, tokenOffset) {
        builder.addFieldOffset(0, tokenOffset, 0);
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static create(builder, tokenOffset) {
        RequestUserEnter.startRequestUserEnter(builder);
        RequestUserEnter.addToken(builder, tokenOffset);
        return RequestUserEnter.end(builder);
    }
    unpack() {
        return new RequestUserEnterT(this.token());
    }
    unpackTo(_o) {
        _o.token = this.token();
    }
}
exports.RequestUserEnter = RequestUserEnter;
class RequestUserEnterT {
    constructor(token = null) {
        this.token = token;
    }
    pack(builder) {
        const token = (this.token !== null ? builder.createString(this.token) : 0);
        return RequestUserEnter.create(builder, token);
    }
}
exports.RequestUserEnterT = RequestUserEnterT;
//# sourceMappingURL=request-user-enter.js.map