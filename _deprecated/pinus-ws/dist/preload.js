"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preload = void 0;
const bluebird_1 = require("bluebird");
// 支持注解
require("reflect-metadata");
const pinus_1 = require("pinus");
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
function preload() {
    // 使用bluebird输出完整的promise调用链
    global.Promise = bluebird_1.Promise;
    // 开启长堆栈
    bluebird_1.Promise.config({
        // Enable warnings
        warnings: true,
        // Enable long stack traces
        longStackTraces: true,
        // Enable cancellation
        cancellation: true,
        // Enable monitoring
        monitoring: true
    });
    // 自动解析ts的sourcemap
    require('source-map-support').install({
        handleUncaughtExceptions: false
    });
    // 捕获普通异常
    process.on('uncaughtException', function (err) {
        console.error(pinus_1.pinus.app.getServerId(), 'uncaughtException Caught exception: ', err);
    });
    // 捕获async异常
    process.on('unhandledRejection', (reason, p) => {
        console.error(pinus_1.pinus.app.getServerId(), 'Caught Unhandled Rejection at:', p, 'reason:', reason);
    });
    // 修复BigInt序列化的问题
    // @ts-ignore
    BigInt.prototype.toJSON = function () { return this.toString(); };
    // https://en.wikipedia.org/wiki/Signal_(IPC)
    // http://nodejs.cn/api/process/signal_events.html
    // ['SIGKILL', 'SIGSTOP'] 如果试图注册将触发 Error: uv_signal_start EINVAL
    // ['SIGPROF'] 如果试图注册将触发 Warning: process.on(SIGPROF) is reserved while debugging
    ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP', 'SIGBREAK'].forEach(signal => process.on(signal, (sig) => {
        console.error((pinus_1.pinus.app?.getServerId() || 'unknown') + ':' + process.pid, 'Caught ' + sig + ', exiting');
        process.exit();
    }));
}
exports.preload = preload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3ByZWxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQW1DO0FBQ25DLE9BQU87QUFDUCw0QkFBMEI7QUFDMUIsaUNBQThCO0FBRTlCOzs7O0dBSUc7QUFDSCxTQUFnQixPQUFPO0lBQ25CLDRCQUE0QjtJQUMxQixNQUFjLENBQUMsT0FBZSxHQUFJLGtCQUFlLENBQUM7SUFDcEQsUUFBUTtJQUNSLGtCQUFPLENBQUMsTUFBTSxDQUFDO1FBQ1gsa0JBQWtCO1FBQ2xCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsMkJBQTJCO1FBQzNCLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLHNCQUFzQjtRQUN0QixZQUFZLEVBQUUsSUFBSTtRQUNsQixvQkFBb0I7UUFDcEIsVUFBVSxFQUFFLElBQUk7S0FDbkIsQ0FBQyxDQUFDO0lBRUgsbUJBQW1CO0lBQ25CLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNsQyx3QkFBd0IsRUFBRSxLQUFLO0tBQ2xDLENBQUMsQ0FBQztJQUVILFNBQVM7SUFDVCxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsR0FBRztRQUN6QyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsc0NBQXNDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEYsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZO0lBQ1osT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNoRCxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0NBQWdDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNuRyxDQUFDLENBQUMsQ0FBQztJQUVILGlCQUFpQjtJQUNqQixhQUFhO0lBQ2IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQztJQUVqRSw2Q0FBNkM7SUFDN0Msa0RBQWtEO0lBRWxELGlFQUFpRTtJQUNqRSxpRkFBaUY7SUFDakYsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUF3QixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDbEgsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQUssQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksU0FBUyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsU0FBUyxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUMxRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUM7QUEzQ0QsMEJBMkNDIn0=