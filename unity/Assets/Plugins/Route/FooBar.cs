public class FooBar : RouteBase {
public Cmd CallFoo = new Cmd("connector.entryHandler.callFoo", typeof(Proto.Foo), typeof(Proto.Bar));
public Cmd PushBar = new Cmd("connector.entryHandler.pushBar", null, typeof(Proto.Bar));
public Cmd CallBar = new Cmd("connector.entryHandler.callBar", typeof(Proto.Bar), typeof(Proto.Foo));
}