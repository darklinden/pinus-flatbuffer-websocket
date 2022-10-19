"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapXDataT = exports.MapXData = void 0;
const flatbuffers = require("flatbuffers");
const map_xdata_row_js_1 = require("../proto/map-xdata-row.js");
class MapXData {
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
        return (obj || new MapXData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new MapXData()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    rows(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new map_xdata_row_js_1.MapXDataRow()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    rowsLength() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startMapXData(builder) {
        builder.startObject(1);
    }
    static addRows(builder, rowsOffset) {
        builder.addFieldOffset(0, rowsOffset, 0);
    }
    static createRowsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }
    static startRowsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static finishMapXDataBuffer(builder, offset) {
        builder.finish(offset);
    }
    static finishSizePrefixedMapXDataBuffer(builder, offset) {
        builder.finish(offset, undefined, true);
    }
    static create(builder, rowsOffset) {
        MapXData.startMapXData(builder);
        MapXData.addRows(builder, rowsOffset);
        return MapXData.end(builder);
    }
    unpack() {
        return new MapXDataT(this.bb.createObjList(this.rows.bind(this), this.rowsLength()));
    }
    unpackTo(_o) {
        _o.rows = this.bb.createObjList(this.rows.bind(this), this.rowsLength());
    }
}
exports.MapXData = MapXData;
class MapXDataT {
    constructor(rows = []) {
        this.rows = rows;
    }
    pack(builder) {
        const rows = MapXData.createRowsVector(builder, builder.createObjectOffsetList(this.rows));
        return MapXData.create(builder, rows);
    }
}
exports.MapXDataT = MapXDataT;
//# sourceMappingURL=map-xdata.js.map