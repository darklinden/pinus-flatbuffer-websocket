"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarT = exports.Bar = void 0;
const flatbuffers = require("flatbuffers");
class Bar {
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
        return (obj || new Bar()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new Bar()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    bar() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
    }
    static startBar(builder) {
        builder.startObject(1);
    }
    static addBar(builder, bar) {
        builder.addFieldInt64(0, bar, BigInt('0'));
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static create(builder, bar) {
        Bar.startBar(builder);
        Bar.addBar(builder, bar);
        return Bar.end(builder);
    }
    unpack() {
        return new BarT(this.bar());
    }
    unpackTo(_o) {
        _o.bar = this.bar();
    }
}
exports.Bar = Bar;
class BarT {
    constructor(bar = BigInt('0')) {
        this.bar = bar;
    }
    pack(builder) {
        return Bar.create(builder, this.bar);
    }
}
exports.BarT = BarT;
//# sourceMappingURL=bar.js.map