public class FooBar : RouteBase {
public Cmd OnFoo = new Cmd("connector.entryHandler.onFoo", typeof(Proto.Foo), typeof(Proto.Bar));
public Cmd OnBar = new Cmd("connector.entryHandler.onBar", typeof(Proto.Bar), typeof(Proto.Foo));
}