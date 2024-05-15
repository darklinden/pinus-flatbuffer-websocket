"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec3T = exports.Vec3 = void 0;
const flatbuffers = require("flatbuffers");
class Vec3 {
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
        return (obj || new Vec3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new Vec3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    x() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    y() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    z() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    static startVec3(builder) {
        builder.startObject(3);
    }
    static addX(builder, x) {
        builder.addFieldInt32(0, x, 0);
    }
    static addY(builder, y) {
        builder.addFieldInt32(1, y, 0);
    }
    static addZ(builder, z) {
        builder.addFieldInt32(2, z, 0);
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static create(builder, x, y, z) {
        Vec3.startVec3(builder);
        Vec3.addX(builder, x);
        Vec3.addY(builder, y);
        Vec3.addZ(builder, z);
        return Vec3.end(builder);
    }
    unpack() {
        return new Vec3T(this.x(), this.y(), this.z());
    }
    unpackTo(_o) {
        _o.x = this.x();
        _o.y = this.y();
        _o.z = this.z();
    }
}
exports.Vec3 = Vec3;
class Vec3T {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    pack(builder) {
        return Vec3.create(builder, this.x, this.y, this.z);
    }
}
exports.Vec3T = Vec3T;
//# sourceMappingURL=vec3.js.map