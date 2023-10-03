"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfoT = exports.UserInfo = void 0;
const flatbuffers = require("flatbuffers");
class UserInfo {
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
        return (obj || new UserInfo()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new UserInfo()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    level() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    static startUserInfo(builder) {
        builder.startObject(2);
    }
    static addName(builder, nameOffset) {
        builder.addFieldOffset(0, nameOffset, 0);
    }
    static addLevel(builder, level) {
        builder.addFieldInt32(1, level, 0);
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static create(builder, nameOffset, level) {
        UserInfo.startUserInfo(builder);
        UserInfo.addName(builder, nameOffset);
        UserInfo.addLevel(builder, level);
        return UserInfo.end(builder);
    }
    unpack() {
        return new UserInfoT(this.name(), this.level());
    }
    unpackTo(_o) {
        _o.name = this.name();
        _o.level = this.level();
    }
}
exports.UserInfo = UserInfo;
class UserInfoT {
    constructor(name = null, level = 0) {
        this.name = name;
        this.level = level;
    }
    pack(builder) {
        const name = (this.name !== null ? builder.createString(this.name) : 0);
        return UserInfo.create(builder, name, this.level);
    }
}
exports.UserInfoT = UserInfoT;
//# sourceMappingURL=user-info.js.map