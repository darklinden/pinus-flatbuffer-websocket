#if UNITY_WEBGL && (!UNITY_EDITOR || UNITY_WEBSOCKET_WEBGL_IMPL)
// WebGL平台 且 (不在编辑器下, 或强制指定使用WebGL实现), 使用此实现

using System;
using XPool;

namespace UnityWebSocket
{
    public class WebSocket : IWebSocket
    {
        public string Address { get; private set; }
        public string[] SubProtocols { get; private set; }
        public WebSocketState ReadyState { get { return (WebSocketState)WebSocketManager.WebSocketGetState(instanceId); } }

        public event EventHandler<WSEventArgs> OnOpen;
        public event EventHandler<WSEventArgs> OnClose;
        public event EventHandler<WSEventArgs> OnError;
        public event EventHandler<WSEventArgs> OnMessage;

        internal int instanceId = 0;

        public WebSocket(string address)
        {
            this.Address = address;
            AllocateInstance();
        }

        public WebSocket(string address, string subProtocol)
        {
            this.Address = address;
            this.SubProtocols = new string[] { subProtocol };
            AllocateInstance();
        }

        public WebSocket(string address, string[] subProtocols)
        {
            this.Address = address;
            this.SubProtocols = subProtocols;
            AllocateInstance();
        }

        internal void AllocateInstance()
        {
            instanceId = WebSocketManager.AllocateInstance(this.Address);
#if UNITY_WEBSOCKET_LOG
            Log.D("Allocate socket with instanceId", instanceId);
#endif
            if (this.SubProtocols == null) return;
            foreach (var protocol in this.SubProtocols)
            {
                if (string.IsNullOrEmpty(protocol)) continue;
#if UNITY_WEBSOCKET_LOG
                Log.D("Add Sub Protocol", protocol, "with instanceId", instanceId);
#endif
                int code = WebSocketManager.WebSocketAddSubProtocol(instanceId, protocol);
                if (code < 0)
                {
                    HandleOnError(GetErrorMessageFromCode(code));
                    break;
                }
            }
        }

        ~WebSocket()
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("Free socket with instanceId", instanceId);
#endif
            WebSocketManager.WebSocketFree(instanceId);
        }

        public void ConnectAsync()
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("Connect with instanceId", instanceId);
#endif
            WebSocketManager.Add(this);
            int code = WebSocketManager.WebSocketConnect(instanceId);
            if (code < 0) HandleOnError(GetErrorMessageFromCode(code));
        }

        public void ConnectAsync(System.Threading.CancellationToken cancellationToken)
        {
            Log.W("ConnectAsync with CancellationToken is not supported on WebGL platform.");
#if UNITY_WEBSOCKET_LOG
            Log.D("Connect with instanceId", instanceId);
#endif
            ConnectAsync();
        }

        public void CloseAsync()
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("Close with instanceId", instanceId);
#endif
            if (ReadyState == WebSocketState.Closed) return;
            int code = WebSocketManager.WebSocketClose(instanceId, (int)CloseStatusCode.Normal, "Normal Closure");
            if (code < 0) HandleOnError(GetErrorMessageFromCode(code));
        }

        public void SendAsync(XBuffer data)
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("Send, size", data.Length);
#endif
            int code = WebSocketManager.WebSocketSend(instanceId, data.Bytes, data.Length);
            if (code < 0) HandleOnError(GetErrorMessageFromCode(code));
            data.Dispose();
        }

        internal void HandleOnOpen()
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("OnOpen");
#endif
            var evt = WSEventArgs.Get();
            evt.EventType = WSEventType.Open;
            OnOpen?.Invoke(this, evt);
            evt.Dispose();
        }

        internal void HandleOnMessage(byte[] rawData)
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("OnMessage, size", rawData.Length);
#endif
            var evt = WSEventArgs.Get();
            evt.EventType = WSEventType.Message;
            evt.Data = XBuffer.Get();
            evt.Data.Write(rawData, 0, rawData.Length, 0);
            OnMessage?.Invoke(this, evt);
            evt.Dispose();
        }

        internal void HandleOnClose(ushort code, string reason)
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("OnClose, code:", code, "reason:", reason);
#endif
            var evt = WSEventArgs.Get();
            evt.EventType = WSEventType.Close;
            evt.CloseCode = code;
            evt.Message = reason;
            OnClose?.Invoke(this, evt);
            evt.Dispose();
            WebSocketManager.Remove(instanceId);
        }

        internal void HandleOnError(string msg)
        {
            Log.E("OnError, error:", msg);
            var evt = WSEventArgs.Get();
            evt.EventType = WSEventType.Error;
            evt.Message = msg;
            OnError?.Invoke(this, evt);
            evt.Dispose();
        }

        internal static string GetErrorMessageFromCode(int errorCode)
        {
            switch (errorCode)
            {
                case -1: return "WebSocket instance not found.";
                case -2: return "WebSocket is already connected or in connecting state.";
                case -3: return "WebSocket is not connected.";
                case -4: return "WebSocket is already closing.";
                case -5: return "WebSocket is already closed.";
                case -6: return "WebSocket is not in open state.";
                case -7: return "Cannot close WebSocket. An invalid code was specified or reason is too long.";
                default: return $"Unknown error code {errorCode}.";
            }
        }
    }
}
#endif