import { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Application, IComponent, manualReloadCrons, manualReloadHandlers, manualReloadRemoters } from "pinus";

import { getLogger } from 'pinus-logger';
import * as path from 'path';
let logger = getLogger('pinus', path.basename(__filename));

/**
 * nest组件
 */
export class NestComponent implements IComponent {
    name = "NestComponent";
    app: Application;
    nestApp: INestApplicationContext;

    constructor(app: Application) {
        this.app = app;
        this.app.set(this.name, this);
    }

    /**
     * 组件开始
     */
    start(cb) {
        cb();
    }

    beforeStart(cb) {
        this.bootstrap().then(async nestApp => {
            this.nestApp = nestApp;
            cb();
        })
    }

    /**
     * 组件结束
     * @param cb
     */
    afterStart(cb) {
        process.nextTick(cb);
    }

    // 热更新. 只是示例 需要根据自己的逻辑处理自己的逻辑
    public async hotUpdate() {
        if (this.app.getServerType() == 'master') {
            return;
        }
        // 这里放热更新代码


        // 清除自己逻辑相关的缓存


        // 生成新的nestapp
        await new Promise((resolve) => {
            this.beforeStart(() => {
                resolve(null)
            })
        })

        // 热更新框架
        logger.log(this.app.getServerId(), 'logic hot update  handler')
        manualReloadHandlers(this.app)
        logger.log(this.app.getServerId(), 'logic hot update  remoter')
        manualReloadRemoters(this.app)
        // manualReloadProxies(this.app)
        logger.log(this.app.getServerId(), 'logic hot update  crons')
        manualReloadCrons(this.app)
        logger.log(this.app.getServerId(), 'logic hot update  finished')
    }

    private async bootstrap() {
        const servertype = this.app.getServerType();
        let moduleLocal: any = null;
        logger.log("bootstrap servertype")

        switch (servertype) {
            case 'connector': {
                moduleLocal = require('../servers/connector.module').ConnectorServerModule;
                logger.log('nestApp init: connector');
                break;
            }
            default:
                logger.warn('unknow pinus server type, no nestModule: ', servertype);
                return null
        }

        logger.log('servertype:', servertype, 'before create nestApp');
        const nestApp = await NestFactory.createApplicationContext(moduleLocal);
        logger.log('servertype:', servertype, 'create nest end');
        await nestApp.init();
        logger.log('servertype:', servertype, 'init nest end');
        // 没有listen ,因为只是用nestjs的依赖注入
        return nestApp;
    }
}