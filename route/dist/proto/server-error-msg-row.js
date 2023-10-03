"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerErrorMsgRowT = exports.ServerErrorMsgRow = void 0;
const flatbuffers = require("flatbuffers");
const server_error_type_js_1 = require("../proto/server-error-type.js");
class ServerErrorMsgRow {
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
        return (obj || new ServerErrorMsgRow()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    static getSizePrefixedRoot(bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new ServerErrorMsgRow()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    errCode() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : server_error_type_js_1.ServerErrorType.ERR_SUCCESS;
    }
    errMsg(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
    }
    static startServerErrorMsgRow(builder) {
        builder.startObject(2);
    }
    static addErrCode(builder, errCode) {
        builder.addFieldInt32(0, errCode, server_error_type_js_1.ServerErrorType.ERR_SUCCESS);
    }
    static addErrMsg(builder, errMsgOffset) {
        builder.addFieldOffset(1, errMsgOffset, 0);
    }
    static end(builder) {
        const offset = builder.endObject();
        return offset;
    }
    static create(builder, errCode, errMsgOffset) {
        ServerErrorMsgRow.startServerErrorMsgRow(builder);
        ServerErrorMsgRow.addErrCode(builder, errCode);
        ServerErrorMsgRow.addErrMsg(builder, errMsgOffset);
        return ServerErrorMsgRow.end(builder);
    }
    unpack() {
        return new ServerErrorMsgRowT(this.errCode(), this.errMsg());
    }
    unpackTo(_o) {
        _o.errCode = this.errCode();
        _o.errMsg = this.errMsg();
    }
}
exports.ServerErrorMsgRow = ServerErrorMsgRow;
class ServerErrorMsgRowT {
    constructor(errCode = server_error_type_js_1.ServerErrorType.ERR_SUCCESS, errMsg = null) {
        this.errCode = errCode;
        this.errMsg = errMsg;
    }
    pack(builder) {
        const errMsg = (this.errMsg !== null ? builder.createString(this.errMsg) : 0);
        return ServerErrorMsgRow.create(builder, this.errCode, errMsg);
    }
}
exports.ServerErrorMsgRowT = ServerErrorMsgRowT;
//# sourceMappingURL=server-error-msg-row.js.map