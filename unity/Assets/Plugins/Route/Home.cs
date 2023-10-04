public class Home : RouteBase {
public Cmd Enter = new Cmd("connector.entryHandler.enter", typeof(Proto.RequestUserEnter), typeof(Proto.ResponseUserEnter));
}