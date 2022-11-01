import { ScheduleOptions, SessionService } from 'pinus';
import { Application, FrontendSession } from 'pinus';

import * as flatbuffers from 'flatbuffers';
import { MarkRoute, proto, Structs } from 'route';

export default function (app: Application) {
    return new Handler(app);
}

const channelName = 'foobar';

export class Handler {
    constructor(private app: Application) {

    }

    protected logBytes(bytes: Uint8Array) {
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
    onUserLeave(session: FrontendSession) {
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

    private barBuilder = new flatbuffers.Builder(16);

    /**
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    @MarkRoute('FooBar', proto.Foo, proto.Bar)
    async callFoo(msg: any, session: FrontendSession) {
        const req = msg as proto.IFoo;
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
        let bar = new proto.BarT(req.foo()).pack(this.barBuilder);
        this.barBuilder.finish(bar);
        let buff = this.barBuilder.asUint8Array();
        this.logBytes(buff);

        this.delayPush(session, uid);

        return buff;
    }

    @MarkRoute('FooBar', null, proto.Bar)
    private pushBar() { }

    private async delayPush(session: FrontendSession, uid: bigint) {
        let timer = setInterval(() => {
            clearInterval(timer);

            this.barBuilder.clear();
            let bar = new proto.BarT(uid).pack(this.barBuilder);
            this.barBuilder.finish(bar);
            let buff = this.barBuilder.asUint8Array();

            let channel = this.app.channelService.getChannel(channelName, true);
            channel.apushMessage(Structs.FooBar.PushBar.route, buff, session.frontendId);
        }, 100);
    }

    private fooBuilder = new flatbuffers.Builder(16);

    /**
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    @MarkRoute('FooBar', proto.Bar, proto.Foo)
    async callBar(msg: any, session: FrontendSession) {
        const req = msg as proto.IBar;

        console.log('onBar', req.bar());

        this.fooBuilder.clear();
        let foo = new proto.FooT(req.bar()).pack(this.fooBuilder);
        this.fooBuilder.finish(foo);
        let buff = this.fooBuilder.asUint8Array();
        this.logBytes(buff);
        return buff;
    }
}