import * as flatbuffers from 'flatbuffers';
import { UserInfo } from './ts_generated/proto/user-info';
import { ResponseUserEnter } from './ts_generated/proto/response-user-enter';
import { rsflatEnResponseUserEnter } from 'napi-flatbuffers';

function test_encode(builder: flatbuffers.Builder | null) {

    const responseBuilder = builder || new flatbuffers.Builder(16);

    responseBuilder.clear();

    let nameOffset = responseBuilder.createString("hello");
    const userOffset = UserInfo.create(responseBuilder, nameOffset, 1);

    ResponseUserEnter.startResponseUserEnter(responseBuilder);
    ResponseUserEnter.addCode(responseBuilder, 0);
    ResponseUserEnter.addUser(responseBuilder, userOffset);
    let resp = ResponseUserEnter.end(responseBuilder);
    responseBuilder.finish(resp);

    const buffer = responseBuilder.asUint8Array();
    return buffer;

    // const bb = new flatbuffers.ByteBuffer(buffer);
    // const response = ResponseUserEnter.getRoot(bb);
}

function test_decode(buffer: Uint8Array) {
    const bb = new flatbuffers.ByteBuffer(buffer);
    const response = ResponseUserEnter.getRoot(bb);
}

function main() {
    const test_count = 1000000;

    const responseBuilder = new flatbuffers.Builder(16);
    const buffer = test_encode(responseBuilder);

    const now = Date.now();
    for (let i = 0; i < test_count; i++) {
        test_encode(responseBuilder);
    }
    const end = Date.now();
    const cost = end - now;
    console.log(`test_encode js reuse builder ${test_count} times, cost ${cost} ms, avg ${cost / test_count} ms`);

    const now1 = Date.now();
    for (let i = 0; i < test_count; i++) {
        test_encode(null);
    }
    const end1 = Date.now();
    const cost1 = end1 - now1;
    console.log(`test_encode js new builder ${test_count} times, cost ${cost1} ms, avg ${cost1 / test_count} ms`);

    const now3 = Date.now();
    for (let i = 0; i < test_count; i++) {
        test_decode(buffer);
    }
    const end3 = Date.now();
    const cost3 = end3 - now3;
    console.log(`test_decode js ${test_count} times, cost ${cost3} ms, avg ${cost3 / test_count} ms`);

    const now2 = Date.now();
    for (let i = 0; i < test_count; i++) {
        rsflatEnResponseUserEnter(0, "hello", 1);
    }
    const end2 = Date.now();
    const cost2 = end2 - now2;
    console.log(`rsflatEnResponseUserEnter ${test_count} times, cost ${cost2} ms, avg ${cost2 / test_count} ms`);
}

main();