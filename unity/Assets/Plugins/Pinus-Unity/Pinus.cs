using System;
using PinusUnity;
using Google.FlatBuffers;

public static class Pinus
{
    public static Network Network { get; set; }
    public static EventBus EventBus { get => EventBus.Instance; }

    public static void Connect(string url, bool autoReconnect = false)
    {
        if (Network == null) Network = Network.Default;
        Network.Connect(url, autoReconnect);
    }

    public static void Disconnect()
    {
        if (Network != null) Network.Disconnect();
    }

    public static void SendMessage<T>(int requestId, string route, ByteBuffer msg)
    {
        if (Network != null) Network.SendMessage(requestId, route, msg);
    }

    public static void Request(string route, ByteBuffer msg = null, Action<ByteBuffer> cb = null)
    {
        if (Network != null) Network.Request(route, msg, cb);
    }

    public static void Notify(string route, ByteBuffer data)
    {
        if (Network != null) Network.Notify(route, data);
    }
}