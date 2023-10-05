# try to replace flatbuffers encode from js to napi-rs module to improve performance

> only test small flatbuffers encode/decode performance, large flatbuffers encode/decode performance may be different

## pure rust flatbuffers encode/decode

* project: flatbuffers-rs-test

```shell
cargo run -r
test_encode_decode 1000000 times, cost 367 ms
```

## napi-rs rust extension flatbuffers encode/decode

* napi-rs project: napi-flatbuffers

## js flatbuffers and napi-rs module test encode/decode

* project: flatbuffers-js-test

```shell
tsc
node dist/test.js
test_encode js reuse builder 1000000 times, cost 1726 ms, avg 0.001726 ms
test_encode js new builder 1000000 times, cost 7276 ms, avg 0.007276 ms
test_decode js 1000000 times, cost 1038 ms, avg 0.001038 ms
rsflatEnResponseUserEnter 1000000 times, cost 3299 ms, avg 0.003299 ms
```

## Interpretation

* reuse flatbuffers builder in js is almost 3x fast of new builder every time
* pure rust flatbuffers encode+decode is almose 10x fast of pure js flatbuffers encode+decode reuse builder
* napi-rs rust extension flatbuffers encode is slower than pure js flatbuffers encode/decode reuse builder
* if you can't reuse the flatBuffers builder in js, the napi-rs rust extension flatBuffers encoding/decoding is the best solution
