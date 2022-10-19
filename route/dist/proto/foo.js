"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FooT = exports.Foo = void 0;
const flatbuffers = require("flatbuffers");
class Foo {
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
        return (obj || new Foo()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new Foo()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    foo() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt('0');
    }
    static startFoo(builder) {
        builder.startObject(1);
    }
    static addFoo(builder, foo) {
        builder.addFieldInt64(0, foo, BigInt('0'));
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static create(builder, foo) {
        Foo.startFoo(builder);
        Foo.addFoo(builder, foo);
        return Foo.end(builder);
    }
    unpack() {
        return new FooT(this.foo());
    }
    unpackTo(_o) {
        _o.foo = this.foo();
    }
}
exports.Foo = Foo;
class FooT {
    constructor(foo = BigInt('0')) {
        this.foo = foo;
    }
    pack(builder) {
        return Foo.create(builder, this.foo);
    }
}
exports.FooT = FooT;
//# sourceMappingURL=foo.js.map