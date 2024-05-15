import { getLogger } from 'pinus';
import { Redis } from 'ioredis';
import { Application, events } from 'pinus';
import * as path from 'path';

let logger = getLogger('pinus', path.basename(__filename));

export class DispatchUtil {

    private static _instance: DispatchUtil = null;
    static get instance(): DispatchUtil {
        if (!this._instance) {
            this._instance = new DispatchUtil();
        }
        return this._instance;
    }

    private _redis: Redis = null;
    private get redis() {
        if (!this._redis) {
            this._redis = new Redis(process.env.REDIS_URL);
        }
        return this._redis;
    }

    private app: Application = null;
    public onMasterStart(app: Application) {
        logger.log('Master start');

        this.redis.del('PinusConnectors');

        this.app = app;
        this.app.event.on(events.REMOVE_SERVERS, this.onRemoveServers.bind(this));
    }

    private async onRemoveServers(ids: string[]) {
        if (!ids || !ids.length) {
            return;
        }

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            logger.log('Connector ' + id + ' removed');
            this.redis.srem('PinusConnectors', id);
            this.redis.set('PinusConnectorUrl:' + id, '');
            this.redis.set('PinusConnectorSessionCount:' + id, -1);
        }
    }

    public onConnectorStart(app: Application) {
        logger.log('Connector start ' + app.serverId);
        this.app = app;

        this.setConnector();

        setInterval(this.detectConnectorSessionCountChanged.bind(this), 1000);
    }

    private async setConnector() {
        const serverInfo = this.app.getCurServer();
        if (!serverInfo) {
            return;
        }

        this.redis.sadd('PinusConnectors', serverInfo.id);
        this.redis.set('PinusConnectorUrl:' + serverInfo.id, serverInfo.clientPort);
        this.redis.set('PinusConnectorSessionCount:' + serverInfo.id, -1);
    }

    private detectConnectorSessionCountChanged() {

        const sessionService = this.app.get("sessionService");
        if (!sessionService) {
            return;
        }

        const sessionCount = sessionService.getSessionsCount();

        // logger.log('Connector session count changed: ' + sessionCount, 'DispatchUtil');
        this.redis.set('PinusConnectorSessionCount:' + this.app.serverId, sessionCount);
    }
}
