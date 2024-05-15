"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapXDataRowT = exports.MapXDataRow = void 0;
const flatbuffers = require("flatbuffers");
const vec3_js_1 = require("../proto/vec3.js");
class MapXDataRow {
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
        return (obj || new MapXDataRow()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new MapXDataRow()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    id() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    }
    name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    camp1(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new vec3_js_1.Vec3()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    camp1Length() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    camp2(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new vec3_js_1.Vec3()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    camp2Length() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startMapXDataRow(builder) {
        builder.startObject(4);
    }
    static addId(builder, id) {
        builder.addFieldInt32(0, id, 0);
    }
    static addName(builder, nameOffset) {
        builder.addFieldOffset(1, nameOffset, 0);
    }
    static addCamp1(builder, camp1Offset) {
        builder.addFieldOffset(2, camp1Offset, 0);
    }
    static createCamp1Vector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startCamp1Vector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static addCamp2(builder, camp2Offset) {
        builder.addFieldOffset(3, camp2Offset, 0);
    }
    static createCamp2Vector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startCamp2Vector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static create(builder, id, nameOffset, camp1Offset, camp2Offset) {
        MapXDataRow.startMapXDataRow(builder);
        MapXDataRow.addId(builder, id);
        MapXDataRow.addName(builder, nameOffset);
        MapXDataRow.addCamp1(builder, camp1Offset);
        MapXDataRow.addCamp2(builder, camp2Offset);
        return MapXDataRow.end(builder);
    }
    unpack() {
        return new MapXDataRowT(this.id(), this.name(), this.bb.createObjList(this.camp1.bind(this), this.camp1Length()), this.bb.createObjList(this.camp2.bind(this), this.camp2Length()));
    }
    unpackTo(_o) {
        _o.id = this.id();
        _o.name = this.name();
        _o.camp1 = this.bb.createObjList(this.camp1.bind(this), this.camp1Length());
        _o.camp2 = this.bb.createObjList(this.camp2.bind(this), this.camp2Length());
    }
}
exports.MapXDataRow = MapXDataRow;
class MapXDataRowT {
    constructor(id = 0, name = null, camp1 = [], camp2 = []) {
        this.id = id;
        this.name = name;
        this.camp1 = camp1;
        this.camp2 = camp2;
    }
    pack(builder) {
        const name = (this.name !== null ? builder.createString(this.name) : 0);
        const camp1 = MapXDataRow.createCamp1Vector(builder, builder.createObjectOffsetList(this.camp1));
        const camp2 = MapXDataRow.createCamp2Vector(builder, builder.createObjectOffsetList(this.camp2));
        return MapXDataRow.create(builder, this.id, name, camp1, camp2);
    }
}
exports.MapXDataRowT = MapXDataRowT;
//# sourceMappingURL=map-xdata-row.js.map