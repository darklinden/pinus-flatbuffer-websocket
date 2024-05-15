"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerErrorMsgT = exports.ServerErrorMsg = void 0;
const flatbuffers = require("flatbuffers");
const server_error_msg_row_js_1 = require("../proto/server-error-msg-row.js");
class ServerErrorMsg {
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
        return (obj || new ServerErrorMsg()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new ServerErrorMsg()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    rows(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new server_error_msg_row_js_1.ServerErrorMsgRow()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
    }
    rowsLength() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
    }
    static startServerErrorMsg(builder) {
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
    static finishServerErrorMsgBuffer(builder, offset) {
        builder.finish(offset);
    }
    static finishSizePrefixedServerErrorMsgBuffer(builder, offset) {
        builder.finish(offset, undefined, true);
    }
    static create(builder, rowsOffset) {
        ServerErrorMsg.startServerErrorMsg(builder);
        ServerErrorMsg.addRows(builder, rowsOffset);
        return ServerErrorMsg.end(builder);
    }
    unpack() {
        return new ServerErrorMsgT(this.bb.createObjList(this.rows.bind(this), this.rowsLength()));
    }
    unpackTo(_o) {
        _o.rows = this.bb.createObjList(this.rows.bind(this), this.rowsLength());
    }
}
exports.ServerErrorMsg = ServerErrorMsg;
class ServerErrorMsgT {
    constructor(rows = []) {
        this.rows = rows;
    }
    pack(builder) {
        const rows = ServerErrorMsg.createRowsVector(builder, builder.createObjectOffsetList(this.rows));
        return ServerErrorMsg.create(builder, rows);
    }
}
exports.ServerErrorMsgT = ServerErrorMsgT;
//# sourceMappingURL=server-error-msg.js.map