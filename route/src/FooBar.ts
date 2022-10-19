import { Cmd } from './Cmd';
import { RouteBase } from './RouteBase';
import { proto } from './proto/internal';

export class FooBar extends RouteBase {
public OnFoo: Cmd = Cmd.create('connector.entryHandler.onFoo', proto.Foo, proto.Bar);
public OnBar: Cmd = Cmd.create('connector.entryHandler.onBar', proto.Bar, proto.Foo);
}