import { Application, FrontendSession } from 'pinus';
import { MarkRoute, proto } from 'route';
import { getNestClass } from '../../../utils/nestutil';
import { Injectable } from '@nestjs/common';
import { UserEnterService } from '../../../domain/teller/user-enter/user-enter.service';

export default function (app: Application) {
    return getNestClass(app, EntryHandler);
}

@Injectable()
export class EntryHandler {
    constructor(
        private app: Application,
        private readonly userEnterService: UserEnterService,
    ) {

    }

    /**
     * New client entry chat server.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    @MarkRoute('Home', proto.RequestUserEnter, proto.ResponseUserEnter)
    async enter(msg: any, session: FrontendSession) {
        return await this.userEnterService.enter(this.app, msg, session);
    }
}