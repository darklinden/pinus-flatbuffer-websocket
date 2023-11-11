import { Cmd } from './Cmd';
import { RouteBase } from './RouteBase';
import { proto } from './proto/internal';

export class Home extends RouteBase {
    public Enter = Cmd.create('connector.entryHandler.enter', proto.RequestUserEnter, proto.ResponseUserEnter);
}