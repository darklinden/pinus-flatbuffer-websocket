export declare const PKG_HEAD_BYTES = 4;
export declare const MSG_FLAG_BYTES = 1;
export declare const MSG_ROUTE_CODE_BYTES = 2;
export declare const MSG_ID_MAX_BYTES = 5;
export declare const MSG_ROUTE_LEN_BYTES = 1;
export declare const MSG_ROUTE_CODE_MAX = 65535;
export declare const MSG_COMPRESS_ROUTE_MASK = 1;
export declare const MSG_COMPRESS_GZIP_MASK = 1;
export declare const MSG_COMPRESS_GZIP_ENCODE_MASK: number;
export declare const MSG_TYPE_MASK = 7;
export declare const ERR_CONNECT_TIMEOUT = "timeout";

export declare function copyArray(dest: Uint8Array, doffset: number, src: Uint8Array | string, soffset: number, length: number): void;
export declare function msgHasId(type: number): boolean;
export declare function msgHasRoute(type: number): boolean;
export declare function caculateMsgIdBytes(id: number): number;
export declare function encodeMsgFlag(type: number, compressRoute: number, buffer: Uint8Array, offset: number, compressGzip: number): number;
export declare function encodeMsgId(id: number, buffer: Uint8Array, offset: number): number;
export declare function encodeMsgRoute(compressRoute: number, route: number | string | Uint8Array, buffer: Uint8Array, offset: number): number;
export declare function encodeMsgBody(msg: Uint8Array, buffer: Uint8Array, offset: number): number;
export declare function timestr(): string;
export declare function log_bytes(title: string, bytes: Uint8Array): void;

export declare enum PinusEvents {
    EVENT_CONNECTED = "pinus.connected",
    EVENT_CLOSED = "pinus.closed",
    EVENT_ERROR = "pinus.error",
    EVENT_HANDSHAKEERROR = "pinus.handshakeerror",
    EVENT_HANDSHAKEOVER = "pinus.handshakeover",
    EVENT_BEENKICKED = "pinus.beenkicked",
    EVENT_MESSAGE = "pinus.onmessage"
}
export interface IEventEmiter {
    emit(name: PinusEvents, data: any): void;
}

export interface IWsClient {
    sendBuffer(buffer: Uint8Array): void;
    get isConnected(): boolean;
    set isConnected(value: boolean);
}

export declare class Message {
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
    static encode(id: number, type: number, compressRoute: number, route: number | string | Uint8Array, msg: Uint8Array, compressGzip?: number): Uint8Array;
    /**
     * Message protocol decode.
     *
     * @param  {Buffer|Uint8Array} buffer message bytes
     * @return {Object}            message object
     */
    static decode(buffer: string | ArrayBuffer): {
        id: number;
        type: number;
        compressRoute: number;
        route: number | string;
        body: Uint8Array;
        compressGzip: number;
    };
}

export declare enum MessageType {
    REQUEST = 0,
    NOTIFY = 1,
    RESPONSE = 2,
    PUSH = 3
}

export declare class Package {
    static TYPE_HANDSHAKE: number;
    static TYPE_HANDSHAKE_ACK: number;
    static TYPE_HEARTBEAT: number;
    static TYPE_DATA: number;
    static TYPE_KICK: number;
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
    static encode(type: number, body?: Uint8Array): Uint8Array;
    /**
     * Package protocol decode.
     * See encode for package format.
     *
     * @param  {Uint8Array} buffer byte array containing package content
     * @return {Object}           {type: package type, buffer: body byte array}
     */
    static decode(buffer: ArrayBuffer): {
        type: number;
        body?: Uint8Array | null;
    } | {
        type: number;
        body?: Uint8Array | null;
    }[];
}

import { IEventEmiter, PinusEvents as Events } from './IEventEmiter';
import { IWsClient } from './IWsClient';
import { Protocol as Protocol_ } from './Protocol';
export type PinusEvents = Events;
export declare const PinusEvents: typeof Events;
export type Protocol = Protocol_;
export declare const Protocol: typeof Protocol_;
export interface IHandshakeBuffer {
    sys: {
        type: string;
        version: string;
        rsa: any;
    };
    user: any;
}
export declare class Pinus {
    DEBUG_LOG: boolean;
    private _emiter;
    set emiter(value: IEventEmiter | null);
    protected event(name: PinusEvents, data?: any): void;
    protected _heartbeatPassed: number;
    protected _heartbeatInterval: number;
    protected _heartbeatTimeout: number;
    protected _shouldHeartbeat: boolean;
    heartbeatInterval(): number;
    heartbeatTimeout(): number;
    heartbeatEnable(): boolean;
    protected _requestId: number;
    get uniqueRequestId(): number;
    protected _requestRouteMap: {
        [key: number]: number | string;
    };
    protected _requestCallbackMap: {
        [key: number]: (data: any) => void;
    };
    protected _handshakeBuffer: IHandshakeBuffer;
    protected _routeMap: {
        [key: string]: number;
    } | null;
    protected _routeMapBack: {
        [key: number]: string;
    } | null;
    protected _client: IWsClient | null;
    set client(value: IWsClient | null);
    get client(): IWsClient | null;
    onOpen(): void;
    onRecv(data: any): void;
    onErr(err: any): void;
    onClose(): void;
    connectTimeout(): void;
    protected renewHeartbeatTimeout(): void;
    protected handshake(data: ArrayBuffer | null): void;
    protected heartbeat(data: ArrayBuffer | null): void;
    heartbeatCheck(dt: number): void;
    protected onData(data: ArrayBuffer | null): void;
    onKick(data: ArrayBuffer | null): void;
    protected _messageHandlers: {
        [key: number]: (data: ArrayBuffer | null) => void;
    } | null;
    protected get messageHandlers(): {
        [key: number]: (data: ArrayBuffer | null) => void;
    };
    protected processPackage(msgs: {
        type: number;
        body?: Uint8Array | null;
    } | {
        type: number;
        body?: Uint8Array | null;
    }[]): void;
    protected decode(data: string | ArrayBuffer | null): {
        id: number;
        route: number | string;
        body: any;
    } | null;
    protected encode(reqId: number, route: number | string, msg: Uint8Array): Uint8Array;
    protected _sendMessage(reqId: number, route: number | string, msg: any): void;
    request(route: string, msg: any, cb: (data: any) => void): void;
    notify(route: number | string, msg: any): void;
}

export declare class Protocol {
    /**
     * pomele client encode
     * id message id;
     * route message route
     * msg message body
     * socketio current support string
     */
    static strencode(str: string): Uint8Array;
    /**
     * client decode
     * msg String data
     * return Message Object
     */
    static strdecode(buffer: ArrayBuffer | null): string;
}
