#if !UNITY_WEBGL || (UNITY_EDITOR && !UNITY_WEBSOCKET_WEBGL_IMPL)
// 非WebGL平台使用此实现 或 编辑器下, 且未指定使用WebGL实现, 使用此实现

using System;
using System.Net.WebSockets;
using Cysharp.Threading.Tasks;
using System.Threading;
using System.Threading.Tasks;
using XPool;

namespace UnityWebSocket
{
    public class WebSocket : IWebSocket
    {
        public string Address { get; private set; }
        public string[] SubProtocols { get; private set; }

        public WebSocketState ReadyState
        {
            get
            {
                if (socket == null)
                    return WebSocketState.Closed;
                switch (socket.State)
                {
                    case System.Net.WebSockets.WebSocketState.Closed:
                    case System.Net.WebSockets.WebSocketState.None:
                        return WebSocketState.Closed;
                    case System.Net.WebSockets.WebSocketState.CloseReceived:
                    case System.Net.WebSockets.WebSocketState.CloseSent:
                        return WebSocketState.Closing;
                    case System.Net.WebSockets.WebSocketState.Connecting:
                        return WebSocketState.Connecting;
                    case System.Net.WebSockets.WebSocketState.Open:
                        return WebSocketState.Open;
                }
                return WebSocketState.Closed;
            }
        }

        public event EventHandler<WSEventArgs> OnOpen;
        public event EventHandler<WSEventArgs> OnClose;
        public event EventHandler<WSEventArgs> OnError;
        public event EventHandler<WSEventArgs> OnMessage;

        private ClientWebSocket socket;
        private bool isOpening => socket != null && socket.State == System.Net.WebSockets.WebSocketState.Open;

        public WebSocket(string address)
        {
            this.Address = address;
        }

        public WebSocket(string address, string subProtocol)
        {
            this.Address = address;
            this.SubProtocols = new string[] { subProtocol };
        }

        public WebSocket(string address, string[] subProtocols)
        {
            this.Address = address;
            this.SubProtocols = subProtocols;
        }

        public void ConnectAsync()
        {
            ConnectAsync(CancellationToken.None);
        }

        public void ConnectAsync(CancellationToken cancellationToken)
        {
#if UNITY_WEBSOCKET_LOG
            Log.D($"ConnectAsync");
#endif
            System.Net.ServicePointManager.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;
            // System.Net.ServicePointManager.ServerCertificateValidationCallback =
            //  ClientWebSocketOptions.RemoteCertificateValidationCallback

            WebSocketManager.Instance.Add(this);

            if (socket != null)
            {
                HandleError(new Exception("Socket is busy."));
                return;
            }
            socket = new ClientWebSocket();
            if (this.SubProtocols != null)
            {
                foreach (var protocol in this.SubProtocols)
                {
                    if (string.IsNullOrEmpty(protocol)) continue;
#if UNITY_WEBSOCKET_LOG
                    Log.D($"Add Sub Protocol {protocol}");
#endif
                    socket.Options.AddSubProtocol(protocol);
                }
            }
            ConnectTask(cancellationToken).Forget();
        }

        public void CloseAsync()
        {
            if (!isOpening) return;
            SendBufferAsync(null, WebSocketMessageType.Close);
        }

        private async UniTask ConnectTask(CancellationToken cancellationToken)
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("Connect Task Begin ...");
#endif

            try
            {
                var uri = new Uri(Address);
                await socket.ConnectAsync(uri, cancellationToken);
            }
            catch (Exception e)
            {
                HandleError(e);
                HandleClose((ushort)CloseStatusCode.Abnormal, e.Message);
                SocketDispose();
                return;
            }

            HandleOpen();

#if UNITY_WEBSOCKET_LOG
            Log.D("Connect Task End !");
#endif

            await ReceiveTask();
        }

        public struct SendTaskStruct
        {
            public WebSocketMessageType Type { get; set; }
            public XBuffer Buffer { get; set; }
        }

        private object sendQueueLock = new object();
        private System.Collections.Generic.Queue<SendTaskStruct> sendQueue = new System.Collections.Generic.Queue<SendTaskStruct>();
        private bool isSendTaskRunning;

        public void SendAsync(XBuffer data)
        {
            SendBufferAsync(data);
        }

        private void SendBufferAsync(XBuffer buffer, WebSocketMessageType type = WebSocketMessageType.Binary)
        {
            if (isSendTaskRunning)
            {
                lock (sendQueueLock)
                {
                    if (type == WebSocketMessageType.Close)
                    {
                        sendQueue.Clear();
                    }
                    sendQueue.Enqueue(new SendTaskStruct { Type = type, Buffer = buffer });
                }
            }
            else
            {
                isSendTaskRunning = true;
                sendQueue.Enqueue(new SendTaskStruct { Type = type, Buffer = buffer });
                SendTask().Forget();
            }
        }

        private async UniTaskVoid SendTask()
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("Send Task Begin ...");
#endif

            try
            {
                while (sendQueue.Count > 0 && isOpening)
                {
#if UNITY_WEBSOCKET_LOG
                    Log.D("SendTask Dequeue");
#endif
                    SendTaskStruct st;
                    lock (sendQueueLock)
                    {
                        st = sendQueue.Dequeue();
                    }
                    if (st.Type == WebSocketMessageType.Close)
                    {
#if UNITY_WEBSOCKET_LOG
                        Log.D("Close Send Begin ...");
#endif
                        await socket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, "Normal Closure", CancellationToken.None);
#if UNITY_WEBSOCKET_LOG
                        Log.D("Close Send End !");
#endif
                    }
                    else
                    {
#if UNITY_WEBSOCKET_LOG
                        Log.D("Send, type:", st.Type, "buffer:", st.Buffer, "queue left:", sendQueue.Count);
#endif
                        await socket.SendAsync(new ReadOnlyMemory<byte>(st.Buffer.Bytes, 0, st.Buffer.Length), st.Type, true, CancellationToken.None);
                        st.Buffer.Dispose();
                        st.Buffer = null;
                    }
                }
            }
            catch (Exception e)
            {
                HandleError(e);
            }
            finally
            {
                isSendTaskRunning = false;
            }

#if UNITY_WEBSOCKET_LOG
            Log.D("Send Task End !");
#endif
        }

        private async UniTask ReceiveTask()
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("Receive Task Begin ...");
#endif

            string closeReason = "";
            ushort closeCode = 0;
            bool isClosed = false;
            var memory = new Memory<byte>(new byte[4096]);

            try
            {
                XBuffer buffer = null;
                int index = 0;
                while (!isClosed)
                {
                    var result = await socket.ReceiveAsync(memory, CancellationToken.None);
                    if (buffer == null) buffer = XBuffer.Get();
                    // 如果一次没有收完, 继续收
                    buffer.Write(memory, 0, result.Count, index);
                    if (!result.EndOfMessage)
                    {
                        index += result.Count;
                        continue;
                    }
                    index = 0;
                    switch (result.MessageType)
                    {
                        case WebSocketMessageType.Text:
                        case WebSocketMessageType.Binary:
                            HandleMessage(buffer);
                            break;
                        case WebSocketMessageType.Close:
                            isClosed = true;
                            break;
                        default:
                            break;
                    }
                    buffer = null;
                }
            }
            catch (Exception e)
            {
                HandleError(e);
            }

            closeCode = (ushort)socket.CloseStatus;
            closeReason = socket.CloseStatusDescription;

            HandleClose(closeCode, closeReason);
            SocketDispose();

#if UNITY_WEBSOCKET_LOG
            Log.D("Receive Task End !");
#endif
        }

        private void SocketDispose()
        {
            sendQueue.Clear();
            socket.Dispose();
            socket = null;
        }

        private void HandleOpen()
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("OnOpen");
#endif
            var evt = WSEventArgs.Get();
            evt.EventType = WSEventType.Open;
            HandleEventSync(evt);
        }

        private void HandleMessage(XBuffer buffer)
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("OnMessage, size:", buffer);
#endif
            var evt = WSEventArgs.Get();
            evt.EventType = WSEventType.Message;
            evt.Data = buffer;
            HandleEventSync(evt);
        }

        private void HandleClose(ushort code, string reason)
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("OnClose, code:", code, "reason:", reason);
#endif
            var evt = WSEventArgs.Get();
            evt.EventType = WSEventType.Close;
            evt.CloseCode = code;
            evt.Message = reason;
            HandleEventSync(evt);
        }

        private void HandleError(Exception exception)
        {
            Log.E("OnError, error:", exception.Message);
            var evt = WSEventArgs.Get();
            evt.EventType = WSEventType.Error;
            evt.Message = exception.Message;
            HandleEventSync(evt);
        }

        private readonly System.Collections.Generic.Queue<WSEventArgs> eventQueue = new System.Collections.Generic.Queue<WSEventArgs>();
        private readonly object eventQueueLock = new object();
        private void HandleEventSync(WSEventArgs eventArgs)
        {
            lock (eventQueueLock)
            {
                eventQueue.Enqueue(eventArgs);
            }
        }

        internal void Update()
        {
            WSEventArgs e;
            while (eventQueue.Count > 0)
            {
                lock (eventQueueLock)
                {
                    e = eventQueue.Dequeue();
                }

                switch (e.EventType)
                {
                    case WSEventType.Open:
                        OnOpen?.Invoke(this, e);
                        break;
                    case WSEventType.Message:
                        OnMessage?.Invoke(this, e);
                        break;
                    case WSEventType.Close:
                        OnClose?.Invoke(this, e);
                        break;
                    case WSEventType.Error:
                        OnError?.Invoke(this, e);
                        break;
                    default:
                        break;
                }
                if (e != null) e.Dispose();
            }
        }
    }
}

#endif