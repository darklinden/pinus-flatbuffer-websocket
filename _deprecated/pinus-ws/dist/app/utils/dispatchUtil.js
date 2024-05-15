"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchUtil = void 0;
const pinus_1 = require("pinus");
const ioredis_1 = require("ioredis");
const pinus_2 = require("pinus");
const path = require("path");
let logger = (0, pinus_1.getLogger)('pinus', path.basename(__filename));
class DispatchUtil {
    constructor() {
        this._redis = null;
        this.app = null;
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new DispatchUtil();
        }
        return this._instance;
    }
    get redis() {
        if (!this._redis) {
            this._redis = new ioredis_1.Redis(process.env.REDIS_URL);
        }
        return this._redis;
    }
    onMasterStart(app) {
        logger.log('Master start');
        this.redis.del('PinusConnectors');
        this.app = app;
        this.app.event.on(pinus_2.events.REMOVE_SERVERS, this.onRemoveServers.bind(this));
    }
    async onRemoveServers(ids) {
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
    onConnectorStart(app) {
        logger.log('Connector start ' + app.serverId);
        this.app = app;
        this.setConnector();
        setInterval(this.detectConnectorSessionCountChanged.bind(this), 1000);
    }
    async setConnector() {
        const serverInfo = this.app.getCurServer();
        if (!serverInfo) {
            return;
        }
        this.redis.sadd('PinusConnectors', serverInfo.id);
        this.redis.set('PinusConnectorUrl:' + serverInfo.id, serverInfo.clientPort);
        this.redis.set('PinusConnectorSessionCount:' + serverInfo.id, -1);
    }
    detectConnectorSessionCountChanged() {
        const sessionService = this.app.get("sessionService");
        if (!sessionService) {
            return;
        }
        const sessionCount = sessionService.getSessionsCount();
        // logger.log('Connector session count changed: ' + sessionCount, 'DispatchUtil');
        this.redis.set('PinusConnectorSessionCount:' + this.app.serverId, sessionCount);
    }
}
exports.DispatchUtil = DispatchUtil;
DispatchUtil._instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcGF0Y2hVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3V0aWxzL2Rpc3BhdGNoVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBa0M7QUFDbEMscUNBQWdDO0FBQ2hDLGlDQUE0QztBQUM1Qyw2QkFBNkI7QUFFN0IsSUFBSSxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFFM0QsTUFBYSxZQUFZO0lBQXpCO1FBVVksV0FBTSxHQUFVLElBQUksQ0FBQztRQVFyQixRQUFHLEdBQWdCLElBQUksQ0FBQztJQXdEcEMsQ0FBQztJQXZFRyxNQUFNLEtBQUssUUFBUTtRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztTQUN2QztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBR0QsSUFBWSxLQUFLO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZUFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbEQ7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUdNLGFBQWEsQ0FBQyxHQUFnQjtRQUNqQyxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsY0FBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFTyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQWE7UUFDdkMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDckIsT0FBTztTQUNWO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLEVBQUUsR0FBRyxVQUFVLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUQ7SUFDTCxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsR0FBZ0I7UUFDcEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFFZixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFcEIsV0FBVyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVPLEtBQUssQ0FBQyxZQUFZO1FBQ3RCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNiLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsR0FBRyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVPLGtDQUFrQztRQUV0QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDakIsT0FBTztTQUNWO1FBRUQsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFdkQsa0ZBQWtGO1FBQ2xGLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLDZCQUE2QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3BGLENBQUM7O0FBekVMLG9DQTBFQztBQXhFa0Isc0JBQVMsR0FBaUIsSUFBSSxDQUFDIn0=