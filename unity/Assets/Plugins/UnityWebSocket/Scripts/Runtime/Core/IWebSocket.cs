using System;

namespace UnityWebSocket
{
    public interface IWebSocket
    {
        void ConnectAsync();

        void CloseAsync();

        void SendAsync(XPool.XBuffer data);

        string Address { get; }

        string[] SubProtocols { get; }

        WebSocketState ReadyState { get; }

        event EventHandler<WSEventArgs> OnMessage;
    }
}
