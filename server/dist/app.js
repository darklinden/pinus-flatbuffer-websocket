"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const coder = require("./app/protobuf_coder");
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
(0, preload_1.preload)();
/**
 * Init app for client.
 */
let app = pinus_1.pinus.createApp();
// let testData = getTestData();
app.set('name', 'test_server');
// app.set('testData', testData);
// let savedTestData = app.get('testData') as proto.ITable;
// console.log('savedTestData:', savedTestData);
// app configuration
app.configure('production|development', 'connector', function () {
    app.set('connectorConfig', {
        connector: pinus_1.pinus.connectors.hybridconnector,
        encode: coder.encode,
        decode: coder.decode,
        heartbeat: 3,
        useDict: true,
        useProtobuf: false
    });
});
// start app
app.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQThCO0FBQzlCLHVDQUFvQztBQUNwQyw4Q0FBOEM7QUFFOUM7Ozs7R0FJRztBQUNILElBQUEsaUJBQU8sR0FBRSxDQUFDO0FBRVY7O0dBRUc7QUFDSCxJQUFJLEdBQUcsR0FBRyxhQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7QUFFNUIsZ0NBQWdDO0FBQ2hDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQy9CLGlDQUFpQztBQUVqQywyREFBMkQ7QUFDM0QsZ0RBQWdEO0FBRWhELG9CQUFvQjtBQUNwQixHQUFHLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLFdBQVcsRUFBRTtJQUNqRCxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUNyQjtRQUNJLFNBQVMsRUFBRSxhQUFLLENBQUMsVUFBVSxDQUFDLGVBQWU7UUFDM0MsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1FBQ3BCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtRQUNwQixTQUFTLEVBQUUsQ0FBQztRQUNaLE9BQU8sRUFBRSxJQUFJO1FBQ2IsV0FBVyxFQUFFLEtBQUs7S0FDckIsQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFDLENBQUM7QUFFSCxZQUFZO0FBQ1osR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIn0=