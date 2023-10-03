import { DictionaryComponentOptions, pinus } from 'pinus';
import { preload } from './preload';
import { NestComponent } from './app/components/nestComponent';
import * as coder from './app/utils/proto_coder';
import * as fs from 'fs';

import { getLogger } from 'pinus-logger';
import * as path from 'path';
let logger = getLogger('pinus', path.basename(__filename));

/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
preload();

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
                && sec.level
            ) {
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
let app = pinus.createApp();

app.set('name', 'test_server');

// app configuration
app.configure('production|development', 'connector', function () {
    app.set('connectorConfig',
        {
            connector: pinus.connectors.hybridconnector,
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
    } as DictionaryComponentOptions)

    logger.log('load nest component');
    app.load(new NestComponent(app));

    // DispatchUtil.instance.onConnectorStart(app);
});

// start app
app.start();

