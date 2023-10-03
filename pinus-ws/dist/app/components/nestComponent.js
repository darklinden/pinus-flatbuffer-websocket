"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestComponent = void 0;
const core_1 = require("@nestjs/core");
const pinus_1 = require("pinus");
const pinus_logger_1 = require("pinus-logger");
const path = require("path");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
/**
 * nest组件
 */
class NestComponent {
    constructor(app) {
        this.name = "NestComponent";
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
        this.bootstrap().then(async (nestApp) => {
            this.nestApp = nestApp;
            cb();
        });
    }
    /**
     * 组件结束
     * @param cb
     */
    afterStart(cb) {
        process.nextTick(cb);
    }
    // 热更新. 只是示例 需要根据自己的逻辑处理自己的逻辑
    async hotUpdate() {
        if (this.app.getServerType() == 'master') {
            return;
        }
        // 这里放热更新代码
        // 清除自己逻辑相关的缓存
        // 生成新的nestapp
        await new Promise((resolve) => {
            this.beforeStart(() => {
                resolve(null);
            });
        });
        // 热更新框架
        logger.log(this.app.getServerId(), 'logic hot update  handler');
        (0, pinus_1.manualReloadHandlers)(this.app);
        logger.log(this.app.getServerId(), 'logic hot update  remoter');
        (0, pinus_1.manualReloadRemoters)(this.app);
        // manualReloadProxies(this.app)
        logger.log(this.app.getServerId(), 'logic hot update  crons');
        (0, pinus_1.manualReloadCrons)(this.app);
        logger.log(this.app.getServerId(), 'logic hot update  finished');
    }
    async bootstrap() {
        const servertype = this.app.getServerType();
        let moduleLocal = null;
        logger.log("bootstrap servertype");
        switch (servertype) {
            case 'connector': {
                moduleLocal = require('../servers/connector.module').ConnectorServerModule;
                logger.log('nestApp init: connector');
                break;
            }
            default:
                logger.warn('unknow pinus server type, no nestModule: ', servertype);
                return null;
        }
        logger.log('servertype:', servertype, 'before create nestApp');
        const nestApp = await core_1.NestFactory.createApplicationContext(moduleLocal);
        logger.log('servertype:', servertype, 'create nest end');
        await nestApp.init();
        logger.log('servertype:', servertype, 'init nest end');
        // 没有listen ,因为只是用nestjs的依赖注入
        return nestApp;
    }
}
exports.NestComponent = NestComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdENvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9jb21wb25lbnRzL25lc3RDb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQTJDO0FBQzNDLGlDQUErRztBQUUvRywrQ0FBeUM7QUFDekMsNkJBQTZCO0FBQzdCLElBQUksTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBRTNEOztHQUVHO0FBQ0gsTUFBYSxhQUFhO0lBS3RCLFlBQVksR0FBZ0I7UUFKNUIsU0FBSSxHQUFHLGVBQWUsQ0FBQztRQUtuQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLEVBQUU7UUFDSixFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFFRCxXQUFXLENBQUMsRUFBRTtRQUNWLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLEVBQUUsRUFBRSxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsVUFBVSxDQUFDLEVBQUU7UUFDVCxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCw2QkFBNkI7SUFDdEIsS0FBSyxDQUFDLFNBQVM7UUFDbEIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLFFBQVEsRUFBRTtZQUN0QyxPQUFPO1NBQ1Y7UUFDRCxXQUFXO1FBR1gsY0FBYztRQUdkLGNBQWM7UUFDZCxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDMUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNqQixDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFBO1FBRUYsUUFBUTtRQUNSLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSwyQkFBMkIsQ0FBQyxDQUFBO1FBQy9ELElBQUEsNEJBQW9CLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSwyQkFBMkIsQ0FBQyxDQUFBO1FBQy9ELElBQUEsNEJBQW9CLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzlCLGdDQUFnQztRQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUseUJBQXlCLENBQUMsQ0FBQTtRQUM3RCxJQUFBLHlCQUFpQixFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsNEJBQTRCLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0lBRU8sS0FBSyxDQUFDLFNBQVM7UUFDbkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM1QyxJQUFJLFdBQVcsR0FBUSxJQUFJLENBQUM7UUFDNUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1FBRWxDLFFBQVEsVUFBVSxFQUFFO1lBQ2hCLEtBQUssV0FBVyxDQUFDLENBQUM7Z0JBQ2QsV0FBVyxHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO2dCQUMzRSxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3RDLE1BQU07YUFDVDtZQUNEO2dCQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsMkNBQTJDLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3JFLE9BQU8sSUFBSSxDQUFBO1NBQ2xCO1FBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDL0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxrQkFBVyxDQUFDLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN2RCw2QkFBNkI7UUFDN0IsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKO0FBckZELHNDQXFGQyJ9