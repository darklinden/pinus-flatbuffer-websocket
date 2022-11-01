import { Cmd } from './Cmd';
import { RouteBase } from './RouteBase';
import { proto } from './proto/internal';

export class FooBar extends RouteBase {
public CallFoo: Cmd = Cmd.create('connector.entryHandler.callFoo', proto.Foo, proto.Bar);
public PushBar: Cmd = Cmd.create('connector.entryHandler.pushBar', null, proto.Bar);
public CallBar: Cmd = Cmd.create('connector.entryHandler.callBar', proto.Bar, proto.Foo);
}