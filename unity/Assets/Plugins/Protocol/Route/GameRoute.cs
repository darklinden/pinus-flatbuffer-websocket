
public class GameRoute : RouteBase {
    public Cmd EntryEntry = new Cmd("entry.entry", typeof(Proto.RequestUserEnter), typeof(Proto.ResponseUserEnter));
    public Cmd EntryHello = new Cmd("entry.hello", typeof(Proto.RequestUserHello), typeof(Proto.ResponseUserHello));
}
