#if (!UNITY_EDITOR && UNITY_WEBGL) || TEST_WEBGL
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
            Log($"Allocate socket with instanceId: {instanceId}");
            if (this.SubProtocols == null) return;
            foreach (var protocol in this.SubProtocols)
            {
                if (string.IsNullOrEmpty(protocol)) continue;
                Log($"Add Sub Protocol {protocol}, with instanceId: {instanceId}");
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
            Log($"Free socket with instanceId: {instanceId}");
            WebSocketManager.WebSocketFree(instanceId);
        }

        public void ConnectAsync()
        {
            Log($"Connect with instanceId: {instanceId}");
            WebSocketManager.Add(this);
            int code = WebSocketManager.WebSocketConnect(instanceId);
            if (code < 0) HandleOnError(GetErrorMessageFromCode(code));
        }

        public void CloseAsync()
        {
            Log($"Close with instanceId: {instanceId}");
            int code = WebSocketManager.WebSocketClose(instanceId, (int)CloseStatusCode.Normal, "Normal Closure");
            if (code < 0) HandleOnError(GetErrorMessageFromCode(code));
        }

        public void SendAsync(PooledBuffer data)
        {
            Log($"Send, size: {data.Length}");
            int code = WebSocketManager.WebSocketSend(instanceId, data.Bytes, data.Length);
            if (code < 0) HandleOnError(GetErrorMessageFromCode(code));
            data.Release();
        }

        internal void HandleOnOpen()
        {
            Log("OnOpen");
            var evt = WSEventArgs.Create();
            evt.EventType = WSEventType.Open;
            OnOpen?.Invoke(this, evt);
            evt.Release();
        }

        internal void HandleOnMessage(byte[] rawData)
        {
            Log($"OnMessage, size: {rawData.Length}");
            var evt = WSEventArgs.Create();
            evt.EventType = WSEventType.Message;
            evt.Data = PooledBuffer.Create();
            evt.Data.Write(rawData, 0, rawData.Length, 0);
            OnMessage?.Invoke(this, evt);
            evt.Release();
        }

        internal void HandleOnClose(ushort code, string reason)
        {
            Log($"OnClose, code: {code}, reason: {reason}");
            var evt = WSEventArgs.Create();
            evt.EventType = WSEventType.Close;
            evt.CloseCode = code;
            evt.Message = reason;
            OnClose?.Invoke(this, evt);
            evt.Release();
            WebSocketManager.Remove(instanceId);
        }

        internal void HandleOnError(string msg)
        {
            Log("OnError, error: " + msg);
            var evt = WSEventArgs.Create();
            evt.EventType = WSEventType.Error;
            evt.Message = msg;
            OnError?.Invoke(this, evt);
            evt.Release();
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

        [System.Diagnostics.Conditional("UNITY_WEB_SOCKET_LOG")]
        static void Log(string msg)
        {
            UnityEngine.Debug.Log($"[UnityWebSocket]" +
                $"[{DateTime.Now.TimeOfDay}]" +
                $" {msg}");
        }
    }
}
#endif
