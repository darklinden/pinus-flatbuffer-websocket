"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const nestComponent_1 = require("./app/components/nestComponent");
const coder = require("./app/utils/proto_coder");
const fs = require("fs");
const pinus_logger_1 = require("pinus-logger");
const path = require("path");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
(0, preload_1.preload)();
// read adminServer.json from env
const adminServer = __dirname + '/config/adminServer.json';
let adminServerData = null;
if (process.env.ADMIN_SERVER) {
    try {
        adminServerData = JSON.parse(process.env.ADMIN_SERVER);
    }
    catch (e) {
        logger.error('adminServer.json is not a valid json string');
    }
    let adminServerDataCheck = false;
    if (adminServerData && adminServerData.length > 0) {
        for (let i = 0; i < adminServerData.length; i++) {
            const sec = adminServerData[i];
            if (sec.type && sec.type.length && sec.token && sec.token.length) {
                adminServerDataCheck = true;
            }
            else {
                adminServerDataCheck = false;
                break;
            }
        }
    }
    if (adminServerDataCheck) {
        fs.writeFileSync(adminServer, process.env.ADMIN_SERVER);
        logger.log('adminServer.json is updated');
    }
    else {
        logger.error('ADMIN_SERVER is not a valid adminServer.json string');
    }
}
else {
    logger.error('ADMIN_SERVER is not defined');
}
// read adminUser.json from env
const adminUser = __dirname + '/config/adminUser.json';
let adminUserData = null;
if (process.env.ADMIN_USER) {
    try {
        adminUserData = JSON.parse(process.env.ADMIN_USER);
    }
    catch (e) {
        logger.error('adminUser.json is not a valid json string');
    }
    let adminUserDataCheck = false;
    if (adminUserData && adminUserData.length > 0) {
        for (let i = 0; i < adminUserData.length; i++) {
            const sec = adminUserData[i];
            if (sec.id && sec.id.length
                && sec.username && sec.username.length
                && sec.password && sec.password.length
                && sec.level) {
                adminUserDataCheck = true;
            }
            else {
                adminUserDataCheck = false;
                break;
            }
        }
    }
    if (adminUserDataCheck) {
        fs.writeFileSync(adminUser, process.env.ADMIN_USER);
        logger.log('adminUser.json is updated');
    }
    else {
        logger.error('ADMIN_USER is not a valid adminUser.json string');
    }
}
else {
    logger.error('ADMIN_USER is not defined');
}
/**
 * Init app for client.
 */
let app = pinus_1.pinus.createApp();
app.set('name', 'test_server');
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
    // 不自动按照路由生成router,仅使用 config/dictionary 内的路由.
    // 具体看 packages/pinus/lib/components/dictionary.ts DictionaryComponentOptions
    // 使用 yarn run build-deps 根据标注 @MarkRoute 自动生成路由表
    app.set('dictionaryConfig', {
        ignoreAutoRouter: true,
    });
    logger.log('load nest component');
    app.load(new nestComponent_1.NestComponent(app));
    // DispatchUtil.instance.onConnectorStart(app);
});
// start app
app.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQTBEO0FBQzFELHVDQUFvQztBQUNwQyxrRUFBK0Q7QUFDL0QsaURBQWlEO0FBQ2pELHlCQUF5QjtBQUV6QiwrQ0FBeUM7QUFDekMsNkJBQTZCO0FBQzdCLElBQUksTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBRTNEOzs7O0dBSUc7QUFDSCxJQUFBLGlCQUFPLEdBQUUsQ0FBQztBQUVWLGlDQUFpQztBQUNqQyxNQUFNLFdBQVcsR0FBRyxTQUFTLEdBQUcsMEJBQTBCLENBQUM7QUFDM0QsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzNCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7SUFDMUIsSUFBSTtRQUNBLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDMUQ7SUFDRCxPQUFPLENBQUMsRUFBRTtRQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztLQUMvRDtJQUVELElBQUksb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0lBQ2pDLElBQUksZUFBZSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQy9DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLE1BQU0sR0FBRyxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsS0FBSyxD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