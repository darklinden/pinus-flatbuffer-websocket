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

        Action<IWebSocket, WSEventArgs> OnOpen { get; set; }
        Action<IWebSocket, WSEventArgs> OnClose { get; set; }
        Action<IWebSocket, WSEventArgs> OnError { get; set; }
        Action<IWebSocket, WSEventArgs> OnMessage { get; set; }
    }
}
