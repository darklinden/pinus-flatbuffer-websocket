"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const pinus_1 = require("pinus");
const flatbuffers = require("flatbuffers");
const route_1 = require("route");
function default_1(app) {
    return new Handler(app);
}
exports.default = default_1;
const channelName = 'foobar';
class Handler {
    constructor(app) {
        this.app = app;
        this.barBuilder = new flatbuffers.Builder(16);
        this.fooBuilder = new flatbuffers.Builder(16);
    }
    logBytes(bytes) {
        let str = "<bytes len: " + bytes.length + ' ';
        str += '[';
        for (var i = 0; i < bytes.length; i++) {
            if (i > 0) {
                str += ' ';
            }
            let tmp = ('0' + bytes[i].toString(16));
            str += tmp.length > 2 ? tmp.substring(tmp.length - 2) : tmp;
        }
        str += ']>';
        console.log(str);
    }
    /**
     * User log out handler
     *
     * @param {Object} app current application
     * @param {Object} session current session object
     *
     */
    onUserLeave(session) {
        if (!session || !session.uid) {
            return;
        }
        console.log(session.uid, 'leave');
        let channel = this.app.channelService.getChannel(channelName, false);
        // leave channel
        if (!!channel) {
            channel.leave(session.uid, session.frontendId);
        }
    }
    /**
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    async callFoo(msg, session) {
        const req = msg;
        // bind userid with session
        let uid = req.foo();
        let uid_str = uid.toString();
        if (!session.uid) {
            await session.abind(uid_str);
            session.on('closed', this.onUserLeave.bind(this));
            // enter channel
            let channel = this.app.channelService.getChannel(channelName, true);
            channel.add(uid_str, session.frontendId);
        }
        this.barBuilder.clear();
        let bar = new route_1.proto.BarT(req.foo()).pack(this.barBuilder);
        this.barBuilder.finish(bar);
        let buff = this.barBuilder.asUint8Array();
        this.logBytes(buff);
        this.delayPush(session, uid);
        return buff;
    }
    pushBar() { }
    async delayPush(session, uid) {
        let timer = setInterval(() => {
            clearInterval(timer);
            this.barBuilder.clear();
            let bar = new route_1.proto.BarT(uid).pack(this.barBuilder);
            this.barBuilder.finish(bar);
            let buff = this.barBuilder.asUint8Array();
            let channel = this.app.channelService.getChannel(channelName, true);
            channel.apushMessage(route_1.Structs.FooBar.PushBar.route, buff, session.frontendId);
        }, 100);
    }
    /**
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    async callBar(msg, session) {
        const req = msg;
        console.log('onBar', req.bar());
        this.fooBuilder.clear();
        let foo = new route_1.proto.FooT(req.bar()).pack(this.fooBuilder);
        this.fooBuilder.finish(foo);
        let buff = this.fooBuilder.asUint8Array();
        this.logBytes(buff);
        return buff;
    }
}
__decorate([
    (0, route_1.MarkRoute)('FooBar', route_1.proto.Foo, route_1.proto.Bar),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pinus_1.FrontendSession]),
    __metadata("design:returntype", Promise)
], Handler.prototype, "callFoo", null);
__decorate([
    (0, route_1.MarkRoute)('FooBar', null, route_1.proto.Bar),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Handler.prototype, "pushBar", null);
__decorate([
    (0, route_1.MarkRoute)('FooBar', route_1.proto.Bar, route_1.proto.Foo),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pinus_1.FrontendSession]),
    __metadata("design:returntype", Promise)
], Handler.prototype, "callBar", null);
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLGlDQUFxRDtBQUVyRCwyQ0FBMkM7QUFDM0MsaUNBQWtEO0FBRWxELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQztBQUU3QixNQUFhLE9BQU87SUFDaEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQXVDNUIsZUFBVSxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQW1EekMsZUFBVSxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQXhGakQsQ0FBQztJQUVTLFFBQVEsQ0FBQyxLQUFpQjtRQUNoQyxJQUFJLEdBQUcsR0FBRyxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDOUMsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNYLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDUCxHQUFHLElBQUksR0FBRyxDQUFDO2FBQ2Q7WUFFRCxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFH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