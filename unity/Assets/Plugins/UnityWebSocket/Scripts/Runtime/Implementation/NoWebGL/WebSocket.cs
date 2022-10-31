#if (UNITY_EDITOR || !UNITY_WEBGL) && !TEST_WEBGL
using System;
using System.Collections.Generic;
using System.Text;
using System.Net.WebSockets;
using System.IO;
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

        public async void ConnectAsync()
        {
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
                    Log.D($"Add Sub Protocol {protocol}");
                    socket.Options.AddSubProtocol(protocol);
                }
            }
            await ConnectTask();
        }

        public void CloseAsync()
        {
            if (!isOpening) return;
            SendBufferAsync(null, WebSocketMessageType.Close);
        }


        private async Task ConnectTask()
        {
            Log.D("Connect Task Begin ...");

            try
            {
                var uri = new Uri(Address);
                await socket.ConnectAsync(uri, CancellationToken.None);
            }
            catch (Exception e)
            {
                HandleError(e);
                HandleClose((ushort)CloseStatusCode.Abnormal, e.Message);
                SocketDispose();
                return;
            }

            HandleOpen();

            Log.D("Connect Task End !");

            await ReceiveTask();
        }

        public struct SendTaskStruct
        {
            public WebSocketMessageType Type { get; set; }
            public PooledBuffer Buffer { get; set; }
        }

        private object sendQueueLock = new object();
        private Queue<SendTaskStruct> sendQueue = new Queue<SendTaskStruct>();
        private bool isSendTaskRunning;

        public void SendAsync(PooledBuffer data)
        {
            SendBufferAsync(data);
        }

        private void SendBufferAsync(PooledBuffer buffer, WebSocketMessageType type = WebSocketMessageType.Binary)
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
                // Task.Run(SendTask);
                SendTask();
            }
        }

        private async void SendTask()
        {
            Log.D("Send Task Begin ...");

            try
            {
                while (sendQueue.Count > 0 && isOpening)
                {
                    Log.D("SendTask Dequeue");

                    SendTaskStruct st;
                    lock (sendQueueLock)
                    {
                        st = sendQueue.Dequeue();
                    }
                    if (st.Type == WebSocketMessageType.Close)
                    {
                        Log.D($"Close Send Begin ...");
                        await socket.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, "Normal Closure", CancellationToken.None);
                        Log.D($"Close Send End !");
                    }
                    else
                    {
                        Log.D("Send, type:", st.Type, "len:", st.Buffer.Length, "size:", st.Buffer.Bytes, "queue left:", sendQueue.Count);
                        await socket.SendAsync(new ArraySegment<byte>(st.Buffer.Bytes, 0, st.Buffer.Length), st.Type, true, CancellationToken.None);
                        st.Buffer.Release();
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

            Log.D("Send Task End !");
        }

        private async Task ReceiveTask()
        {
            Log.D("Receive Task Begin ...");

            string closeReason = "";
            ushort closeCode = 0;
            bool isClosed = false;
            var segment = new ArraySegment<byte>(new byte[4096]);

            try
            {
                PooledBuffer buffer = null;
                int index = 0;
                while (!isClosed)
                {
                    var result = await socket.ReceiveAsync(segment, CancellationToken.None);
                    if (buffer == null) buffer = PooledBuffer.Create();
                    buffer.Write(segment.Array, 0, result.Count, index);
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
                            closeCode = (ushort)result.CloseStatus;
                            closeReason = result.CloseStatusDescription;
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
                closeCode = (ushort)CloseStatusCode.Abnormal;
                closeReason = e.Message;
            }

            HandleClose(closeCode, closeReason);
            SocketDispose();

            Log.D("Receive Task End !");
        }

        private void SocketDispose()
        {
            sendQueue.Clear();
            socket.Dispose();
            socket = null;
        }

        private void HandleOpen()
        {
            Log.D("OnOpen");
            var evt = WSEventArgs.Create();
            evt.EventType = WSEventType.Open;
            HandleEventSync(evt);
        }

        private void HandleMessage(PooledBuffer buffer)
        {
            Log.D("OnMessage, size:", buffer.Bytes);
            var evt = WSEventArgs.Create();
            evt.EventType = WSEventType.Message;
            evt.Data = buffer;
            HandleEventSync(evt);
        }

        private void HandleClose(ushort code, string reason)
        {
            Log.D("OnClose, code:", code, "reason:", reason);
            var evt = WSEventArgs.Create();
            evt.EventType = WSEventType.Close;
            evt.CloseCode = code;
            evt.Message = reason;
            HandleEventSync(evt);
        }

        private void HandleError(Exception exception)
        {
            Log.E("OnError, error:", exception.Message);
            var evt = WSEventArgs.Create();
            evt.EventType = WSEventType.Error;
            evt.Message = exception.Message;
            HandleEventSync(evt);
        }

        private readonly Queue<WSEventArgs> eventQueue = new Queue<WSEventArgs>();
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
            }
        }
    }
}
#endif
