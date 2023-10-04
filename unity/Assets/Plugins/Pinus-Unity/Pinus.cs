using System;
using PinusUnity;
using Google.FlatBuffers;
using Cysharp.Threading.Tasks;

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

    public static async UniTask<ByteBuffer> AsyncRequest(string route, FlatBufferBuilder builder = null)
    {
        ByteBuffer result = null;
        if (Network != null)
        {
            result = await Network.AsyncRequest(route, builder);
        }

        if (builder != null) builder.Clear();

        return result;
    }

    public static void Notify(string route, ByteBuffer data)
    {
        if (Network != null) Network.Notify(route, data);
    }
}