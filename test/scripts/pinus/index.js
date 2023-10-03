'use strict';

var PKG_HEAD_BYTES = 4;
var MSG_FLAG_BYTES = 1;
var MSG_ROUTE_CODE_BYTES = 2;
var MSG_ROUTE_LEN_BYTES = 1;
var MSG_ROUTE_CODE_MAX = 0xffff;
var MSG_COMPRESS_ROUTE_MASK = 0x1;
var MSG_COMPRESS_GZIP_MASK = 0x1;
var MSG_COMPRESS_GZIP_ENCODE_MASK = 1 << 4;
var MSG_TYPE_MASK = 0x7;
var ERR_CONNECT_TIMEOUT = 'timeout';

var MessageType;
(function (MessageType) {
    MessageType[MessageType["REQUEST"] = 0] = "REQUEST";
    MessageType[MessageType["NOTIFY"] = 1] = "NOTIFY";
    MessageType[MessageType["RESPONSE"] = 2] = "RESPONSE";
    MessageType[MessageType["PUSH"] = 3] = "PUSH";
})(MessageType || (MessageType = {}));

function copyArray(dest, doffset, src, soffset, length) {
    // Uint8Array
    if (typeof src == 'string') {
        for (var index = 0; index < length; index++) {
            dest[doffset++] = parseInt(src[soffset++]);
        }
    }
    else {
        for (var index = 0; index < length; index++) {
            dest[doffset++] = src[soffset++];
        }
    }
}
function msgHasId(type) {
    return type === MessageType.REQUEST || type === MessageType.RESPONSE;
}
function msgHasRoute(type) {
    return type === MessageType.REQUEST || type === MessageType.NOTIFY ||
        type === MessageType.PUSH;
}
function caculateMsgIdBytes(id) {
    var len = 0;
    do {
        len += 1;
        id >>= 7;
    } while (id > 0);
    return len;
}
function encodeMsgFlag(type, compressRoute, buffer, offset, compressGzip) {
    if (type !== MessageType.REQUEST && type !== MessageType.NOTIFY &&
        type !== MessageType.RESPONSE && type !== MessageType.PUSH) {
        throw new Error('unkonw message type: ' + type);
    }
    buffer[offset] = (type << 1) | (compressRoute ? 1 : 0);
    if (compressGzip) {
        buffer[offset] = buffer[offset] | MSG_COMPRESS_GZIP_ENCODE_MASK;
    }
    return offset + MSG_FLAG_BYTES;
}
function encodeMsgId(id, buffer, offset) {
    do {
        var tmp = id % 128;
        var next = Math.floor(id / 128);
        if (next !== 0) {
            tmp = tmp + 128;
        }
        buffer[offset++] = tmp;
        id = next;
    } while (id !== 0);
    return offset;
}
function encodeMsgRoute(compressRoute, route, buffer, offset) {
    if (compressRoute) {
        if (typeof route == 'number' && route > MSG_ROUTE_CODE_MAX) {
            throw new Error('route number is overflow');
        }
        buffer[offset++] = (route >> 8) & 0xff;
        buffer[offset++] = route;
    }
    else {
        if (route) {
            buffer[offset++] = route.length & 0xff;
            copyArray(buffer, offset, route, 0, route.length);
            offset += route.length;
        }
        else {
            buffer[offset++] = 0;
        }
    }
    return offset;
}
function encodeMsgBody(msg, buffer, offset) {
    copyArray(buffer, offset, msg, 0, msg.length);
    return offset + msg.length;
}
function timestr() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var ms = "00" + date.getMilliseconds();
    return '[' + hours + ':' + minutes.slice(-2) + ':' + seconds.slice(-2) + '.' + ms.slice(-3) + '] ';
}
function log_bytes(title, bytes) {
    var str = " <bytes len: " + bytes.length + ' ';
    str += '[';
    for (var i = 0; i < bytes.length; i++) {
        if (i > 0) {
            str += ' ';
        }
        var tmp = ('0' + bytes[i].toString(16));
        str += tmp.length > 2 ? tmp.substring(tmp.length - 2) : tmp;
    }
    str += ']>';
    console.log(timestr(), title, str);
}

var PinusEvents$1;
(function (PinusEvents) {
    PinusEvents["EVENT_CONNECTED"] = "pinus.connected";
    PinusEvents["EVENT_CLOSED"] = "pinus.closed";
    PinusEvents["EVENT_ERROR"] = "pinus.error";
    PinusEvents["EVENT_HANDSHAKEERROR"] = "pinus.handshakeerror";
    PinusEvents["EVENT_HANDSHAKEOVER"] = "pinus.handshakeover";
    PinusEvents["EVENT_BEENKICKED"] = "pinus.beenkicked";
    PinusEvents["EVENT_MESSAGE"] = "pinus.onmessage";
})(PinusEvents$1 || (PinusEvents$1 = {}));

var Protocol$1 = /** @class */ (function () {
    function Protocol() {
    }
    /**
     * pomele client encode
     * id message id;
     * route message route
     * msg message body
     * socketio current support string
     */
    Protocol.strencode = function (str) {
        var byteArray = new Uint8Array(str.length * 3);
        var offset = 0;
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            var codes = void 0;
            if (charCode <= 0x7f) {
                codes = [charCode];
            }
            else if (charCode <= 0x7ff) {
                codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)];
            }
            else {
                codes = [0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f)];
            }
            for (var j = 0; j < codes.length; j++) {
                byteArray[offset] = codes[j];
                ++offset;
            }
        }
        var _buffer = new Uint8Array(offset);
        copyArray(_buffer, 0, byteArray, 0, offset);
        return _buffer;
    };
    /**
     * client decode
     * msg String data
     * return Message Object
     */
    Protocol.strdecode = function (buffer) {
        if (buffer == null)
            return '';
        var bytes = new Uint8Array(buffer);
        var array = [];
        var offset = 0;
        var charCode = 0;
        var end = bytes.length;
        while (offset < end) {
            if (bytes[offset] < 128) {
                charCode = bytes[offset];
                offset += 1;
            }
            else if (bytes[offset] < 224) {
                charCode = ((bytes[offset] & 0x1f) << 6) + (bytes[offset + 1] & 0x3f);
                offset += 2;
            }
            else {
                charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
                offset += 3;
            }
            array.push(charCode);
        }
        return String.fromCharCode.apply(null, array);
    };
    return Protocol;
}());

var Message = /** @class */ (function () {
    function Message() {
    }
    /**
     * Message protocol encode.
     *
     * @param  {Number} id            message id
     * @param  {Number} type          message type
     * @param  {Number} compressRoute whether compress route
     * @param  {Number|String} route  route code or route string
     * @param  {Buffer} msg           message body bytes
     * @return {Buffer}               encode result
     */
    Message.encode = function (id, type, compressRoute, route, msg, compressGzip) {
        if (compressGzip === void 0) { compressGzip = 0; }
        // caculate message max length
        var idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0;
        var msgLen = MSG_FLAG_BYTES + idBytes;
        if (msgHasRoute(type)) {
            if (compressRoute) {
                if (typeof route !== 'number') {
                    throw new Error('error flag for number route!');
                }
                msgLen += MSG_ROUTE_CODE_BYTES;
            }
            else {
                msgLen += MSG_ROUTE_LEN_BYTES;
                if (route) {
                    route = Protocol$1.strencode(route);
                    if (route.length > 255) {
                        throw new Error('route maxlength is overflow');
                    }
                    msgLen += route.length;
                }
            }
        }
        if (msg) {
            msgLen += msg.length;
        }
        var buffer = new Uint8Array(msgLen);
        var offset = 0;
        // add flag
        offset = encodeMsgFlag(type, compressRoute, buffer, offset, compressGzip);
        // add message id
        if (msgHasId(type)) {
            offset = encodeMsgId(id, buffer, offset);
        }
        // add route
        if (msgHasRoute(type)) {
            offset = encodeMsgRoute(compressRoute, route, buffer, offset);
        }
        // add body
        if (msg) {
            offset = encodeMsgBody(msg, buffer, offset);
        }
        return buffer;
    };
    /**
     * Message protocol decode.
     *
     * @param  {Buffer|Uint8Array} buffer message bytes
     * @return {Object}            message object
     */
    Message.decode = function (buffer) {
        var bytes = typeof buffer == 'string' ? new TextEncoder().encode(buffer) : new Uint8Array(buffer);
        var bytesLen = bytes.length || bytes.byteLength;
        var offset = 0;
        var id = 0;
        var route = -1;
        // parse flag
        var flag = bytes[offset++];
        var compressRoute = flag & MSG_COMPRESS_ROUTE_MASK;
        var type = (flag >> 1) & MSG_TYPE_MASK;
        var compressGzip = (flag >> 4) & MSG_COMPRESS_GZIP_MASK;
        // parse id
        if (msgHasId(type)) {
            var m = 0;
            var i = 0;
            do {
                m = parseInt(bytes[offset] + '');
                id += (m & 0x7f) << (7 * i);
                offset++;
                i++;
            } while (m >= 128);
        }
        // parse route
        if (msgHasRoute(type)) {
            if (compressRoute) {
                route = (bytes[offset++]) << 8 | bytes[offset++];
            }
            else {
                var routeLen = bytes[offset++];
                if (routeLen) {
                    var ra = new Uint8Array(routeLen);
                    copyArray(ra, 0, bytes, offset, routeLen);
                    route = Protocol$1.strdecode(ra);
                }
                else {
                    route = '';
                }
                offset += routeLen;
            }
        }
        // parse body
        var bodyLen = bytesLen - offset;
        var body = new Uint8Array(bodyLen);
        copyArray(body, 0, bytes, offset, bodyLen);
        return {
            id: id,
            type: type,
            compressRoute: compressRoute,
            route: route,
            body: body,
            compressGzip: compressGzip
        };
    };
    return Message;
}());

var Package = /** @class */ (function () {
    function Package() {
    }
    /**
     * Package protocol encode.
     *
     * Pomelo package format:
     * +------+-------------+------------------+
     * | type | body length |       body       |
     * +------+-------------+------------------+
     *
     * Head: 4bytes
     *   0: package type,
     *      1 - handshake,
     *      2 - handshake ack,
     *      3 - heartbeat,
     *      4 - data
     *      5 - kick
     *   1 - 3: big-endian body length
     * Body: body length bytes
     *
     * @param  {Number}    type   package type
     * @param  {Uint8Array} body   body content in bytes
     * @return {Uint8Array}        new byte array that contains encode result
     */
    Package.encode = function (type, body) {
        var length = body ? body.length : 0;
        var buffer = new Uint8Array(PKG_HEAD_BYTES + length);
        var index = 0;
        buffer[index++] = type & 0xff;
        buffer[index++] = (length >> 16) & 0xff;
        buffer[index++] = (length >> 8) & 0xff;
        buffer[index++] = length & 0xff;
        if (body) {
            copyArray(buffer, index, body, 0, length);
        }
        return buffer;
    };
    /**
     * Package protocol decode.
     * See encode for package format.
     *
     * @param  {Uint8Array} buffer byte array containing package content
     * @return {Object}           {type: package type, buffer: body byte array}
     */
    Package.decode = function (buffer) {
        var offset = 0;
        var bytes = new Uint8Array(buffer);
        var length = 0;
        var rs = [];
        while (offset < bytes.length) {
            var type = bytes[offset++];
            length = ((bytes[offset++]) << 16 | (bytes[offset++]) << 8 | bytes[offset++]) >>> 0;
            var body = length ? new Uint8Array(length) : null;
            if (body) {
                copyArray(body, 0, bytes, offset, length);
            }
            offset += length;
            rs.push({ type: type, body: body });
        }
        return rs.length === 1 ? rs[0] : rs;
    };
    Package.TYPE_HANDSHAKE = 1;
    Package.TYPE_HANDSHAKE_ACK = 2;
    Package.TYPE_HEARTBEAT = 3;
    Package.TYPE_DATA = 4;
    Package.TYPE_KICK = 5;
    return Package;
}());

var PinusEvents = PinusEvents$1;
var Protocol = Protocol$1;
var JS_WS_CLIENT_TYPE = 'ws';
var JS_WS_CLIENT_VERSION = '0.0.5';
var RES_OK = 200;
var RES_OLD_CLIENT = 501;
var Pinus = /** @class */ (function () {
    function Pinus() {
        this.DEBUG_LOG = false;
        // --- EventTarget begin ---
        this._emiter = null;
        // --- EventTarget end --- 
        this._heartbeatPassed = 0;
        this._heartbeatInterval = 0;
        this._heartbeatTimeout = 0;
        this._shouldHeartbeat = false;
        this._requestId = 1;
        // Map from request id to route
        this._requestRouteMap = {};
        // callback from request id
        this._requestCallbackMap = {};
        this._handshakeBuffer = {
            sys: {
                type: JS_WS_CLIENT_TYPE,
                version: JS_WS_CLIENT_VERSION,
                rsa: {}
            },
            user: {}
        };
        this._routeMap = null;
        this._routeMapBack = null;
        this._client = null;
        this._messageHandlers = null;
    }
    Object.defineProperty(Pinus.prototype, "emiter", {
        set: function (value) {
            this._emiter = value;
        },
        enumerable: false,
        configurable: true
    });
    Pinus.prototype.event = function (name, data) {
        if (data === void 0) { data = null; }
        if (this._emiter) {
            this._emiter.emit(name, data);
        }
    };
    Pinus.prototype.heartbeatInterval = function () {
        return this._heartbeatInterval;
    };
    Pinus.prototype.heartbeatTimeout = function () {
        return this._heartbeatTimeout;
    };
    Pinus.prototype.heartbeatEnable = function () {
        return this._heartbeatInterval > 0;
    };
    Object.defineProperty(Pinus.prototype, "uniqueRequestId", {
        get: function () {
            this._requestId++;
            if (this._requestId >= 40000)
                this._requestId = 1;
            return this._requestId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pinus.prototype, "client", {
        get: function () {
            return this._client;
        },
        set: function (value) {
            this._client = value;
        },
        enumerable: false,
        configurable: true
    });
    // --- Socket begin ---
    Pinus.prototype.onOpen = function () {
        var _a;
        this.event(PinusEvents.EVENT_CONNECTED);
        var d = JSON.stringify(this._handshakeBuffer);
        var obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(d));
        this.DEBUG_LOG && log_bytes('onOpen', obj);
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.sendBuffer(obj);
    };
    Pinus.prototype.onRecv = function (data) {
        this.processPackage(Package.decode(data));
        // new package arrived, update the heartbeat timeout
        this.renewHeartbeatTimeout();
    };
    Pinus.prototype.onErr = function (err) {
        this.event(PinusEvents.EVENT_ERROR, err);
    };
    Pinus.prototype.onClose = function () {
        this.event(PinusEvents.EVENT_CLOSED);
    };
    Pinus.prototype.connectTimeout = function () {
        this.event(PinusEvents.EVENT_ERROR, ERR_CONNECT_TIMEOUT);
    };
    // --- Socket end ---
    Pinus.prototype.renewHeartbeatTimeout = function () {
        this._heartbeatPassed = 0;
    };
    Pinus.prototype.handshake = function (data) {
        var _a;
        var d = JSON.parse(Protocol.strdecode(data));
        this.DEBUG_LOG && console.log(timestr(), 'handshake', d);
        if (d && d.code === RES_OLD_CLIENT) {
            this.event(PinusEvents.EVENT_HANDSHAKEERROR);
            return;
        }
        if (d && d.code !== RES_OK) {
            this.event(PinusEvents.EVENT_HANDSHAKEERROR);
            return;
        }
        if (d && d.sys && d.sys.heartbeat) {
            this._heartbeatInterval = d.sys.heartbeat; // heartbeat interval
            this._heartbeatTimeout = this._heartbeatInterval * 2; // max heartbeat timeout
        }
        else {
            this._heartbeatInterval = 0;
            this._heartbeatTimeout = 0;
        }
        if (d && d.sys) {
            var dict = d.sys.dict;
            // Init compress dict
            if (dict) {
                this._routeMap = {};
                this._routeMapBack = {};
                for (var key in dict) {
                    if (Object.prototype.hasOwnProperty.call(dict, key)) {
                        var value = dict[key];
                        this._routeMap[key] = value;
                        this._routeMapBack[value] = key;
                    }
                }
            }
        }
        this._routeMap = this._routeMap || {};
        this._routeMapBack = this._routeMapBack || {};
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.sendBuffer(Package.encode(Package.TYPE_HANDSHAKE_ACK));
        this.event(PinusEvents.EVENT_HANDSHAKEOVER);
    };
    Pinus.prototype.heartbeat = function (data) {
        if (!this._heartbeatInterval) {
            // no heartbeat
            return;
        }
        this._shouldHeartbeat = true;
    };
    Pinus.prototype.heartbeatCheck = function (dt) {
        var _a;
        if (!this._heartbeatInterval)
            return;
        if (!((_a = this.client) === null || _a === void 0 ? void 0 : _a.isConnected)) {
            this._heartbeatPassed = 0;
            return;
        }
        this._heartbeatPassed += dt;
        if (this._shouldHeartbeat) {
            if (this._heartbeatPassed > this._heartbeatInterval) {
                this.client.sendBuffer(Package.encode(Package.TYPE_HEARTBEAT));
                this.renewHeartbeatTimeout();
            }
            return;
        }
        if (this._heartbeatPassed > this._heartbeatTimeout) {
            console.error('pinus server heartbeat timeout');
            this.onErr('heartbeat timeout');
        }
    };
    Pinus.prototype.onData = function (data) {
        var msg = this.decode(data);
        if (!msg) {
            console.error('pinus onData decode failed');
            return;
        }
        else {
            this.DEBUG_LOG && console.log(timestr(), 'recv', msg);
        }
        if (msg.id) {
            // if have a id then find the callback function with the request
            var cb = this._requestCallbackMap[msg.id];
            delete this._requestCallbackMap[msg.id];
            cb && cb(msg.body);
            return;
        }
        // server push message
        this.event(PinusEvents.EVENT_MESSAGE, msg);
    };
    Pinus.prototype.onKick = function (data) {
        data = JSON.parse(Protocol.strdecode(data));
        this.event(PinusEvents.EVENT_BEENKICKED, data);
    };
    Object.defineProperty(Pinus.prototype, "messageHandlers", {
        get: function () {
            if (!this._messageHandlers) {
                this._messageHandlers = {};
                this._messageHandlers[Package.TYPE_HANDSHAKE] = this.handshake.bind(this);
                this._messageHandlers[Package.TYPE_HEARTBEAT] = this.heartbeat.bind(this);
                this._messageHandlers[Package.TYPE_DATA] = this.onData.bind(this);
                this._messageHandlers[Package.TYPE_KICK] = this.onKick.bind(this);
            }
            return this._messageHandlers;
        },
        enumerable: false,
        configurable: true
    });
    Pinus.prototype.processPackage = function (msgs) {
        if (Array.isArray(msgs)) {
            for (var i = 0; i < msgs.length; i++) {
                var msg = msgs[i];
                var func = this.messageHandlers[msg.type];
                if (func)
                    func(msg.body || null);
            }
        }
        else {
            var func = this.messageHandlers[msgs.type];
            if (func)
                func(msgs.body || null);
        }
    };
    Pinus.prototype.decode = function (data) {
        if (data == null)
            return null;
        // decode
        var msg = Message.decode(data);
        if (msg.id > 0) {
            var r = this._requestRouteMap[msg.id];
            delete this._requestRouteMap[msg.id];
            if (r) {
                msg.route = r;
            }
            else {
                return null;
            }
        }
        var route = null;
        // Decompose route from dict
        if (msg.compressRoute) {
            route = this._routeMapBack[msg.route] || null;
            if (!route)
                return null;
            msg.route = route;
        }
        else {
            route = msg.route;
        }
        return msg;
    };
    Pinus.prototype.encode = function (reqId, route, msg) {
        var type = reqId ? MessageType.REQUEST : MessageType.NOTIFY;
        var compressRoute = 0;
        if (this._routeMap[route]) {
            route = this._routeMap[route];
            compressRoute = 1;
        }
        return Message.encode(reqId, type, compressRoute, route, msg);
    };
    Pinus.prototype._sendMessage = function (reqId, route, msg) {
        var _a;
        this.DEBUG_LOG && log_bytes('sendMessage ' + reqId + ' ' + route, msg);
        var message = this.encode(reqId, route, msg);
        this.DEBUG_LOG && log_bytes('message', message);
        var packet = Package.encode(Package.TYPE_DATA, message);
        this.DEBUG_LOG && log_bytes('packet', packet);
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.sendBuffer(packet);
    };
    Pinus.prototype.request = function (route, msg, cb) {
        route = route || msg.route;
        if (!route) {
            return;
        }
        var reqId = this.uniqueRequestId;
        this._sendMessage(reqId, route, msg);
        this._requestCallbackMap[reqId] = cb;
        this._requestRouteMap[reqId] = route;
    };
    Pinus.prototype.notify = function (route, msg) {
        this._sendMessage(0, route, msg);
    };
    return Pinus;
}());

exports.Pinus = Pinus;
exports.PinusEvents = PinusEvents;
exports.Protocol = Protocol;
