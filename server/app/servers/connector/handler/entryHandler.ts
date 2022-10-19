import { ScheduleOptions, SessionService } from 'pinus';
import { Application, FrontendSession } from 'pinus';

import * as flatbuffers from 'flatbuffers';
import { MarkRoute, proto, Structs } from 'route';

export default function (app: Application) {
    return new Handler(app);
}

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

    private onFooReturnBuilder = new flatbuffers.Builder(16);

    /**
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    @MarkRoute('FooBar', proto.Foo, proto.Bar)
    async onFoo(msg: any, session: FrontendSession) {
        const req = msg as proto.IFoo;

        console.log('onFoo', req.foo());

        this.onFooReturnBuilder.clear();
        let bar = new proto.BarT(req.foo()).pack(this.onFooReturnBuilder);
        this.onFooReturnBuilder.finish(bar);
        let buff = this.onFooReturnBuilder.asUint8Array();
        this.logBytes(buff);
        return buff;
    }

    private onBarReturnBuilder = new flatbuffers.Builder(16);

    /**
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    @MarkRoute('FooBar', proto.Bar, proto.Foo)
    async onBar(msg: any, session: FrontendSession) {
        const req = msg as proto.IBar;

        console.log('onBar', req.bar());

        this.onBarReturnBuilder.clear();
        let foo = new proto.FooT(req.bar()).pack(this.onBarReturnBuilder);
        this.onBarReturnBuilder.finish(foo);
        let buff = this.onBarReturnBuilder.asUint8Array();
        this.logBytes(buff);
        return buff;
    }

    // /**
    //  * New client entry.
    //  *
    //  * @param  {Object}   msg     request message
    //  * @param  {Object}   session current session object
    //  */
    // async entry(msg: any, session: FrontendSession) {
    //     return { code: 200, msg: 'game server is ok.' };
    // }

    // /**
    //  * Publish route for mqtt connector.
    //  *
    //  * @param  {Object}   msg     request message
    //  * @param  {Object}   session current session object
    //  */
    // async publish(msg: any, session: FrontendSession) {
    //     let result = {
    //         topic: 'publish',
    //         payload: JSON.stringify({ code: 200, msg: 'publish message is ok.' })
    //     };
    //     return result;
    // }

    // /**
    //  * Subscribe route for mqtt connector.
    //  *
    //  * @param  {Object}   msg     request message
    //  * @param  {Object}   session current session object
    //  */
    // async subscribe(msg: any, session: FrontendSession) {
    //     let result = {
    //         topic: 'subscribe',
    //         payload: JSON.stringify({ code: 200, msg: 'subscribe message is ok.' })
    //     };
    //     return result;
    // }
}