using System;
using XPool;

namespace UnityWebSocket
{
    public interface IWebSocket
    {
        void ConnectAsync();
        void ConnectAsync(System.Threading.CancellationToken cancellationToken);

        void CloseAsync();

        void SendAsync(XBuffer data);

        string Address { get; }

        string[] SubProtocols { get; }

        WebSocketState ReadyState { get; }

        event EventHandler<WSEventArgs> OnMessage;
    }
}
