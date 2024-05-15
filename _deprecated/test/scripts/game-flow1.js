import http from "k6/http";
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter } from "k6/metrics";
import { random_string } from "./random_string.js"

import { Pinus, PinusEvents } from './pinus/index.js';
import { ServerErrorType } from './proto/server-error-type.js';

import * as flatbuffers from './flatbuffers/flatbuffers.js'
import { RequestUserEnter } from './proto/request-user-enter.js'
import { ResponseUserEnter } from './proto/response-user-enter.js'

const ErrorCount = new Counter("errors");

const DEBUG_LOG = true;
const LIVE_TIME = 10;
const HTTP_TIME_OUT = 10 * 1000;

// export const options = {
//     stages: [
//         { duration: '10s', target: 1000 },
//         { duration: '20s', target: 2000 },
//         { duration: '20s', target: 3000 },
//         { duration: '60s', target: 0 },
//     ]
// };

const http_url = 'http://localhost:3000';
const ws_url = 'ws://localhost:3010';

export default function () {

    let http_login_success = false;
    let handshake_success = false;
    let login_success = false;

    const return_check = () => {
        if (!http_login_success) ErrorCount.add(1, { type: 'http-login' });
        check(http_login_success, {
            "http 登录成功": (d) => http_login_success
        });

        if (!handshake_success) ErrorCount.add(1, { type: 'ws-handshake' });
        check(handshake_success, {
            "ws handshake 成功": (d) => handshake_success
        });

        if (!login_success) ErrorCount.add(1, { type: 'ws-login' });
        check(login_success, {
            "ws login 成功": (d) => login_success
        });
    }

    const account = random_string(8);
    const password = random_string(8);

    // try to login
    const post_data = `{"account":"${account}","password":"${password}"}`;

    const login_response = http.post(
        http_url + `/user/login`,
        post_data,
        { headers: { "Content-Type": "application/json" }, timeout: HTTP_TIME_OUT });


    DEBUG_LOG && console.log('login response', login_response.status, login_response.body);
    if (login_response.status < 200 || login_response.status >= 300) {
        console.error('user/login error', login_response.error);
        return_check();
        return;
    }

    const login_response_data = login_response.json();

    let login_data = null;

    if (login_response_data.code == ServerErrorType.ERR_SUCCESS) {
        // 登录成功
        DEBUG_LOG && console.log('login success', login_response_data.data);
        login_data = login_response_data.data;
    }
    else if (login_response_data.code == ServerErrorType.ERR_FAILED) {
        // 账号不存在 注册

        DEBUG_LOG && console.log('account not exist, register', account);

        const register_response = http.post(
            http_url + `/user/register`,
            post_data,
            { headers: { "Content-Type": "application/json" }, timeout: HTTP_TIME_OUT });

        DEBUG_LOG && console.log('register response', register_response.status, register_response.body);
        if (register_response.status < 200 || register_response.status >= 300) {
            console.error('user/register error', register_response.error);
            return_check();
            return;
        }

        const register_response_data = register_response.json();

        if (register_response_data.code !== ServerErrorType.ERR_SUCCESS) {
            console.error('user/register error', register_response_data);
            return_check();
            return;
        }

        DEBUG_LOG && console.log('register success', register_response_data.data);
        login_data = register_response_data.data;
    }
    else {
        // 其他错误
        console.error('user/login error', login_response_data);
        return_check();
        return;
    }

    http_login_success = login_data != null && login_data.token != null;

    if (!http_login_success) {
        return_check();
        return;
    }

    // connect to game server via websocket

    DEBUG_LOG && console.log('connect to', ws_url);

    ws.connect(ws_url, function (socket) {

        // 设置关闭时间
        socket.setInterval(() => {
            DEBUG_LOG && console.log(LIVE_TIME + ' seconds passed, closing the socket');
            pinus.client.isConnected = false;
            socket.close();
            return_check();
        }, LIVE_TIME * 1000);

        var pinus = new Pinus();
        pinus.DEBUG_LOG = DEBUG_LOG;
        pinus.client = {
            _isConnected: false,
            sendBuffer(buffer) {
                // console.log('send buffer', buffer);
                socket.sendBinary(buffer.buffer);
            },
            get isConnected() {
                return this._isConnected;
            },
            set isConnected(value) {
                this._isConnected = value;
            }
        };
        pinus.emiter = {
            emit(event, data) {
                // console.log('emit', event, data);
                switch (event) {
                    case PinusEvents.EVENT_HANDSHAKEERROR:
                        {
                            console.error('handshake error', data);
                        }
                        break;
                    case PinusEvents.EVENT_HANDSHAKEOVER:
                        {
                            handshake_success = true;

                            if (pinus.heartbeatEnable()) {
                                DEBUG_LOG && console.log('start timer for heartbeat');
                                socket.setInterval(() => {
                                    DEBUG_LOG && console.log('heartbeat check');
                                    pinus.heartbeatCheck(0.1);
                                }, 100);
                            }

                            // 发送登陆包

                            DEBUG_LOG && console.log('send login request');

                            const builder = new flatbuffers.Builder(64);
                            const tokenOffset = builder.createString(login_data.token);
                            const login_request = RequestUserEnter.create(builder, tokenOffset);
                            builder.finish(login_request);

                            pinus.request('entry.entry', builder.asUint8Array(), (data) => {
                                login_success = true;

                                const response = ResponseUserEnter.getRoot(new flatbuffers.ByteBuffer(data));
                                const response_data = response.unpack();

                                DEBUG_LOG && console.log('login success', response_data);
                            });
                        }
                        break;
                    case PinusEvents.EVENT_BEENKICKED:
                        {
                            console.log('been kicked', data);
                            return_check();
                            socket.close();
                        }
                        break;
                    case PinusEvents.EVENT_MESSAGE:
                        {
                            // console.log('message', data);
                        }
                        break;
                    default:
                        break;
                }
            }
        };

        socket.on('open', function open() {
            pinus.onOpen();
        });

        socket.on('binaryMessage', function (message) {
            pinus.onRecv(message);
        });

        socket.on('close', function () {
            pinus.client.isConnected = false;
            pinus.onClose();
        });

        socket.on('error', function (e) {

            // 忽略 1005 错误
            if (e.error().includes('1005')) return;

            if (e.error() != "websocket: close sent") {
                console.error('An unexpected error occured: ', e.error());
                ErrorCount.add(1, { type: 'ws-error' });
            }
        });
    });

    // check(response, {
    //     "ws ok": (r) => r && (r.error == null || r.error.length == 0)
    // });

    // if (response.error) {
    //     console.error('ws error', response.error)
    // }
}