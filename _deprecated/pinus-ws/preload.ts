import { Promise } from 'bluebird';
// 支持注解
import 'reflect-metadata';
import { pinus } from 'pinus';

/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
export function preload() {
    // 使用bluebird输出完整的promise调用链
    ((global as any).Promise as any) = (Promise as any);
    // 开启长堆栈
    Promise.config({
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
        console.error(pinus.app.getServerId(), 'uncaughtException Caught exception: ', err);
    });

    // 捕获async异常
    process.on('unhandledRejection', (reason: any, p) => {
        console.error(pinus.app.getServerId(), 'Caught Unhandled Rejection at:', p, 'reason:', reason);
    });

    // 修复BigInt序列化的问题
    // @ts-ignore
    BigInt.prototype.toJSON = function () { return this.toString() };

    // https://en.wikipedia.org/wiki/Signal_(IPC)
    // http://nodejs.cn/api/process/signal_events.html

    // ['SIGKILL', 'SIGSTOP'] 如果试图注册将触发 Error: uv_signal_start EINVAL
    // ['SIGPROF'] 如果试图注册将触发 Warning: process.on(SIGPROF) is reserved while debugging
    ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP', 'SIGBREAK'].forEach(signal => process.on(signal as NodeJS.Signals, (sig) => {
        console.error((pinus.app?.getServerId() || 'unknown') + ':' + process.pid, 'Caught ' + sig + ', exiting');
        process.exit();
    }));
}
