using System.Collections;
using System;
using UnityEngine;
using Google.FlatBuffers;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using UnityWebSocket;

namespace PinusUnity
{
    public class Network : INetworkHandler
    {
        const int RES_OK = 200;
        const int RES_FAIL = 500;
        const int RES_OLD_CLIENT = 501;

        // --- instances begin ---

        protected static System.Collections.Generic.Dictionary<string, Network> _instances = new System.Collections.Generic.Dictionary<string, Network>();

        public static void Clear(string key)
        {
            Network old = null;
            if (_instances.TryGetValue(key, out old))
            {
                old.Disconnect();
                _instances.Remove(key);
            }
        }

        public static void CleanUp()
        {
            foreach (var kv in _instances)
            {
                kv.Value.Disconnect();
            }
            _instances.Clear();
        }

        public static Network Get(string key)
        {
            Network instance = null;
            if (_instances.TryGetValue(key, out instance))
            {
                return instance;
            }

            instance = new Network(key);
            _instances[key] = instance;
            return instance;
        }

        public static Network Default { get { return Get("Default"); } }
        // --- instances end ---


        protected Client Client { get; set; }
        public string Url
        {
            get { return Client.Url; }
            set { if (Client != null) Client.Url = value; }
        }

        public bool IsConnected { get { return Client != null && Client.IsConnected; } }

        // 心跳检测累计时间 累加
        protected float HeartbeatPassed { get; set; }
        // 心跳检测发送间隔 倒计时
        protected float HeartbeatSendDelay { get; set; }
        // 心跳检测发送间隔时长
        protected float HeartbeatInterval { get; set; }
        // 心跳检测多次发送间隔时长
        protected float HeartbeatSendInterval { get; set; }
        // 心跳检测超时时长
        protected float HeartbeatTimeout { get; set; }
        // 心跳检测需发送
        protected bool ShouldHeartbeat { get; set; } = false;

        public bool HandshakeEnded { get; private set; } = false;

        protected int m_RequestId = 1;
        public int GenerateUniqueRequestId()
        {
            m_RequestId++;
            if (m_RequestId >= 40000) m_RequestId = 1;
            return m_RequestId;
        }

        // Map from request id to route
        protected System.Collections.Generic.Dictionary<int, int> m_RequestRouteMap = new System.Collections.Generic.Dictionary<int, int>(64);
        // callback from request id
        protected System.Collections.Generic.Dictionary<int, Action<ByteBuffer>> m_RequestCallbackMap = new System.Collections.Generic.Dictionary<int, Action<ByteBuffer>>();
        protected System.Collections.Generic.Dictionary<int, AutoResetUniTaskCompletionSource<ByteBuffer>> m_RequestTasks = new System.Collections.Generic.Dictionary<int, AutoResetUniTaskCompletionSource<ByteBuffer>>();

        protected System.Collections.Generic.Dictionary<string, int> m_RouteMap = null;
        protected System.Collections.Generic.Dictionary<int, string> m_RouteMapBack = null;

        protected Network(string key)
        {
            Client = new Client(this);
            EventBus.Instance.OnFrameUpdated -= HeartbeatCheck;
            EventBus.Instance.OnFrameUpdated += HeartbeatCheck;
        }

        // --- Socket begin ---
        private const string HANDSHAKEBUFFER = "{\"sys\":{\"type\":\"ws\",\"version\":\"0.0.1\",\"rsa\":{}},\"user\":{}}";
        private static XPool.XBuffer HandshakeBuffer
        {
            get
            {
                var buffer = XPool.XBuffer.Get();
                buffer.Write(HANDSHAKEBUFFER, Package.PKG_HEAD_BYTES);
                Package.Encode(PackageType.Handshake, buffer, buffer.Length - Package.PKG_HEAD_BYTES);
                return buffer;
            }
        }

        public void OnOpen()
        {
            EventBus.Instance.Connected(Url);

#if PINUS_LOG
            Log.D("OnOpen SendHandshake");
#endif
            Client.SendBuffer(HandshakeBuffer);
        }

        public void OnRecv(XPool.XBuffer data)
        {
            ProcessPackage(data);
        }

        public void OnError(string err)
        {
            HandshakeEnded = false;
            ShouldHeartbeat = false;
            Log.W("Pinus OnError:", Url, err);
            EventBus.Instance.Error(Url, err);
        }

        public void OnClose(ushort closeCode, string closeReason)
        {
            HandshakeEnded = false;
            ShouldHeartbeat = false;
            Log.W("Pinus OnClose:", Url, closeCode, closeReason);
            EventBus.Instance.Closed(Url, closeCode, closeReason);
        }

        public void ConnectTimeout()
        {
            HandshakeEnded = false;
            EventBus.Instance.Error(Url, "Connect Timeout");
        }

        // --- Socket end ---
        protected void RenewHeartbeatTimeout()
        {
#if PINUS_LOG
            Log.D("RenewHeartbeatTimeout");
#endif
            HeartbeatPassed = 0;
            HeartbeatSendDelay = 0;
        }

        void OnHandshake(byte[] data, int offset, int length)
        {
#if PINUS_LOG
            Log.D("OnHandshake", length);
#endif
            var str = Protocol.StrDecode(data, offset, length);
#if PINUS_LOG
            Log.D("OnHandshake", str);
#endif
            var json = LitJson.JsonMapper.ToObject(str);
            if (json == null || json.IsObject == false)
            {
                EventBus.Instance.HandshakeError(Url, "handshake decode fail");
                return;
            }

            var code = json.ContainsKey("code") ? (int)json["code"] : 0;
            if (code == RES_OLD_CLIENT)
            {
#if PINUS_LOG
                Log.D("OnHandshake RES_OLD_CLIENT");
#endif
                EventBus.Instance.HandshakeError(Url, "client version not fullfill");
                return;
            }

            if (code != RES_OK)
            {
#if PINUS_LOG
                Log.D("OnHandshake failed code:", code);
#endif
                EventBus.Instance.HandshakeError(Url, "handshake fail");
                return;
            }

            var sys = json.ContainsKey("sys") ? json["sys"] : null;
            var heartbeat = sys != null && sys.ContainsKey("heartbeat") ? int.Parse(sys["heartbeat"].ToString()) : 0;

            if (heartbeat != 0)
            {
                HeartbeatInterval = heartbeat;          // 间隔 HeartbeatInterval 发送心跳
                HeartbeatSendInterval = heartbeat <= 1 ? heartbeat / 5f : 1;              // 发送心跳后 间隔 HeartbeatSendInterval 再次发送
                HeartbeatTimeout = heartbeat * 2;       // 超时时间
            }
            else
            {
                HeartbeatInterval = 0;
                HeartbeatTimeout = 0;
            }

            var dict = sys != null && sys.ContainsKey("dict") ? sys["dict"] : null;

            if (dict != null)
            {
                m_RouteMap = new System.Collections.Generic.Dictionary<string, int>();
                m_RouteMapBack = new System.Collections.Generic.Dictionary<int, string>();
                foreach (var key in dict.Keys)
                {
                    var value = int.Parse(dict[key].ToString());
                    m_RouteMap[key] = value;
                    m_RouteMapBack[value] = key;
                }
            }

            Client.SendBuffer(Package.SimplePack(PackageType.HandshakeAck));
            HandshakeEnded = true;
            EventBus.Instance.HandshakeOver(Url);
        }

        void OnHeartbeat()
        {
            if (HeartbeatInterval == 0)
            {
                return;
            }

            // 当收到服务器的心跳包时，更新心跳超时时间, 并设置下一次心跳
            RenewHeartbeatTimeout();

            // 服务器收到 HandShakeAck 后会回复 Heartbeat, 这时开始心跳检测
            ShouldHeartbeat = true;
        }

        void HeartbeatCheck()
        {
            if (HeartbeatInterval == 0) return;

            if (!Client.IsConnected)
            {
                // 如果连接已断开, 不关心心跳检测
                ShouldHeartbeat = false;
                return;
            }

            if (!ShouldHeartbeat) return;

            var dt = Time.unscaledDeltaTime;

            // 计时
            HeartbeatPassed += dt;
            HeartbeatSendDelay -= dt;

            // 如果累计时间大于超时检测时间 准备发送心跳
            if (HeartbeatPassed > HeartbeatInterval)
            {
                // 当延迟剩余小于等于 0 时, 发送
                if (HeartbeatSendDelay <= 0)
                {
#if PINUS_LOG
                    Log.D("Pinus Send Heartbeat");
#endif
                    // 设置发送延迟, 防止重复多次发送
                    HeartbeatSendDelay = HeartbeatSendInterval;
                    Client.SendBuffer(Package.SimplePack(PackageType.Heartbeat));
                }
            }

            // 如果累计时间大于超时时间, 进入超时错误处理
            if (HeartbeatPassed > HeartbeatTimeout)
            {
#if PINUS_LOG
                Log.D("Pinus Heartbeat Timeout");
#endif
                Client.Close();
                OnClose((ushort)CloseStatusCode.Abnormal, "Heartbeat Timeout");
            }
        }

        void OnData(byte[] bytes, int offset, int length)
        {
            int id = 0;
            MessageType type;
            int routeCode = 0;
            string routeStr = null;
            int bodyOffset = 0;
            int bodyLength = 0;
            Message.Decode(bytes, offset, length, out id, out type, out routeCode, out routeStr, out bodyOffset, out bodyLength);

            if (id > 0)
            {
                if (m_RequestRouteMap.ContainsKey(id))
                {
                    var rCode = m_RequestRouteMap[id];
                    routeStr = m_RouteMapBack[rCode];
                    m_RequestRouteMap.Remove(id);
                }
                else
                {
                    Log.E("Pinus Server Response Error: Unknown Request Id: " + id);
                    return;
                }
            }

            // Decompose route from dict
            if (routeStr == null)
            {
                m_RouteMapBack.TryGetValue(routeCode, out routeStr);

                if (routeStr == null)
                {
                    Log.E("Pinus Server Response Error: Unknown Route Code: " + routeCode);
                    return;
                }
            }

#if PINUS_LOG
            Log.D("Pinus Recv", routeStr, "Data Length", bodyLength);
#endif

            var bb = ByteBuffer.Get();
            bb.Resize(bytes.Length);
            bb.CopyBytes(bytes, bodyOffset, bodyLength);

            if (id != 0)
            {
                // if have a id then find the callback function with the request
                Action<ByteBuffer> cb = null;
                if (m_RequestCallbackMap.TryGetValue(id, out cb))
                {
                    m_RequestCallbackMap.Remove(id);
                    cb(bb);
                    return;
                }

                if (m_RequestTasks.TryGetValue(id, out var completionSource))
                {
                    m_RequestTasks.Remove(id);
                    completionSource.TrySetResult(bb);
                    return;
                }
            }

            EventDispatcher.Dispatch(routeStr, bb);
            bb.Dispose();
        }

        void OnKick(byte[] data, int offset, int length)
        {
            var d = Protocol.StrDecode(data, offset, length);
#if PINUS_LOG
            Log.D("Pinus Network OnKick", d);
#endif

            EventBus.Instance.BeenKicked(Url);
            Client.Close();
        }

        internal void ProcessPackage(XPool.XBuffer buffer)
        {
            int offset = 0;
            int length = 0;

            var type = Package.Decode(buffer, ref offset, out length);
            while (type != PackageType.Unknown)
            {
                ProcessMessage(type, buffer.Bytes, offset, length);
                offset += length;
                type = Package.Decode(buffer, ref offset, out length);
            }
        }

        internal void ProcessMessage(PackageType type, byte[] bytes, int offset, int length)
        {
            switch (type)
            {
                case PackageType.Handshake:
                    OnHandshake(bytes, offset, length);
                    break;
                case PackageType.Heartbeat:
                    OnHeartbeat();
                    break;
                case PackageType.Data:
                    OnData(bytes, offset, length);
                    break;
                case PackageType.Kick:
                    OnKick(bytes, offset, length);
                    break;
                default:
                    break;
            }
        }

        public void Connect(string url)
        {
            Url = url;
            Connect();
        }

        protected void Connect()
        {
            Disconnect();

            Client.Connect();
        }

        public void Disconnect()
        {
            HandshakeEnded = false;
            ShouldHeartbeat = false;
            Client.Close();
        }

        public void SendMessage(int requestId, int routeCode, ByteBuffer msg)
        {
            UnityEngine.Profiling.Profiler.BeginSample("Pinus.Network.SendMessage");
            var type = requestId > 0 ? MessageType.REQUEST : MessageType.NOTIFY;
            var dataLen = msg != null ? msg.Length - msg.Position : 0;
            var offset = Package.PKG_HEAD_BYTES;

            var buffer = XPool.XBuffer.Get();
            buffer.Resize(dataLen + 16);
            // encode message header
            Message.Encode(requestId, type, routeCode, buffer, ref offset);

            // copy data body
            if (dataLen > 0)
            {
                msg.CopyTo(buffer, offset);
                offset += dataLen;
            }

            // encode package header
            Package.Encode(PackageType.Data, buffer, offset - Package.PKG_HEAD_BYTES);
            buffer.Resize(offset);
            UnityEngine.Profiling.Profiler.EndSample();

            // send data
            Client.SendBuffer(buffer);
        }

        public void SendMessage(int requestId, string route, ByteBuffer msg)
        {
            if (String.IsNullOrEmpty(route))
            {
                Log.E("Pinus Network Notify Error: Empty Route");
                return;
            }
#if PINUS_LOG
            Log.D("Pinus Network SendMessage", "route", route, "requestId", requestId, "data length", msg.Length - msg.Position);
#endif
            var routeCode = m_RouteMap[route];
            SendMessage(requestId, routeCode, msg);
        }

        public void Request(string route, ByteBuffer msg, Action<ByteBuffer> cb = null)
        {
            if (String.IsNullOrEmpty(route))
            {
                Log.E("Pinus Network Request Error: Empty Route");
                return;
            }

            var requestId = GenerateUniqueRequestId();
            var routeCode = m_RouteMap[route];

            SendMessage(requestId, routeCode, msg);
            if (cb != null)
            {
                m_RequestCallbackMap.Add(requestId, cb);
            }
            m_RequestRouteMap.Add(requestId, routeCode);
        }

        public async UniTask<ByteBuffer> AsyncRequest(string route, FlatBufferBuilder builder)
        {
            if (String.IsNullOrEmpty(route))
            {
                Log.E("Pinus Network AsyncRequest Error: Empty Route");
                return null;
            }

            var requestId = GenerateUniqueRequestId();

            if (m_RouteMap.ContainsKey(route) == false)
            {
                Log.E("Pinus Network AsyncRequest Error: Unknown Route: " + route, m_RouteMap);
                return null;
            }

            var routeCode = m_RouteMap[route];

            var completionSource = AutoResetUniTaskCompletionSource<ByteBuffer>.Create();

            m_RequestTasks.Add(requestId, completionSource);

            SendMessage(requestId, routeCode, builder?.DataBuffer);

            builder?.Clear();

            m_RequestRouteMap.Add(requestId, routeCode);

            return await completionSource.Task;
        }

        public void Notify(string route, ByteBuffer data)
        {
            if (String.IsNullOrEmpty(route))
            {
                Log.E("Pinus Network Notify Error: Empty Route");
                return;
            }

            var routeCode = m_RouteMap[route];
            SendMessage(0, routeCode, data);
        }
    }
}