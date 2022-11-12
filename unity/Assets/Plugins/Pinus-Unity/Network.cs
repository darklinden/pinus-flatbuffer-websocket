using System;
using System.Collections.Generic;
using UnityEngine;
using Google.FlatBuffers;
using SimpleJSON;
using XPool;
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

        protected bool m_AutoReconnect = true;
        public bool AutoReconnect { get => m_AutoReconnect; set => m_AutoReconnect = value; }

        protected bool Reconnecting { get; set; }
        protected int ReconnectAttempt { get; set; }

        protected int m_MaxReconnectAttempts = 3;
        public int MaxReconnectAttempts { get => m_MaxReconnectAttempts; set => m_MaxReconnectAttempts = value; }

        protected float HeartbeatPassed { get; set; }
        protected float HeartbeatInterval { get; set; }
        protected float HeartbeatTimeout { get; set; }
        protected bool ShouldHeartbeat { get; set; }
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
            if (Reconnecting)
            {
                EventBus.Instance.Reconnected(Url);
            }

            EventBus.Instance.Connected(Url);

            ResetReconnect();

            Client.SendBuffer(HandshakeBuffer);
        }

        public void OnRecv(XPool.XBuffer data)
        {
            ProcessPackage(data);

            // new package arrived, update the heartbeat timeout
            // Log.D("OnRecv RenewHeartbeatTimeout");
            // RenewHeartbeatTimeout();
        }

        public void OnError(string err)
        {
            HandshakeEnded = false;
            EventBus.Instance.Error(Url, err);
        }

        public void OnClose()
        {
            HandshakeEnded = false;
            EventBus.Instance.Closed(Url);

            if (AutoReconnect && ReconnectAttempt < MaxReconnectAttempts)
            {
                Reconnecting = true;
                ReconnectAttempt++;
                Connect();
            }
        }

        public void ConnectTimeout()
        {
            HandshakeEnded = false;
            EventBus.Instance.Error(Url, "Connect Timeout");
            if (ReconnectAttempt < MaxReconnectAttempts)
            {
                Reconnecting = true;
                ReconnectAttempt++;
                Connect();
            }
        }

        // --- Socket end ---

        protected void ResetReconnect()
        {
            HandshakeEnded = false;
            Reconnecting = false;
            ReconnectAttempt = 0;
        }

        protected void RenewHeartbeatTimeout()
        {
            HeartbeatPassed = 0;
        }

        void OnHandshake(byte[] data, int offset, int length)
        {
            var str = Protocol.StrDecode(data, offset, length);
            var json = JSON.Parse(str);

            var code = json.HasKey("code") ? json["code"].AsInt : -1;
            if (code == RES_OLD_CLIENT)
            {
                EventBus.Instance.HandshakeError(Url, "client version not fullfill");
                return;
            }

            if (code != RES_OK)
            {
                EventBus.Instance.HandshakeError(Url, "handshake fail");
                return;
            }

            var sys = json.HasKey("sys") ? json["sys"] : null;
            var heartbeat = sys != null && sys.HasKey("heartbeat") ? sys["heartbeat"].AsInt : 0;

            if (heartbeat != 0)
            {
                HeartbeatInterval = heartbeat;        // heartbeat interval
                HeartbeatInterval = HeartbeatInterval > 2 ? HeartbeatInterval - 1 : 1; // heartbeat after 1s
                HeartbeatTimeout = HeartbeatInterval * 2;   // max heartbeat timeout
            }
            else
            {
                HeartbeatInterval = 0;
                HeartbeatTimeout = 0;
            }

            var dict = sys != null && sys.HasKey("dict") ? sys["dict"] : null;

            if (dict != null && dict.IsObject)
            {
                m_RouteMap = new System.Collections.Generic.Dictionary<string, int>();
                m_RouteMapBack = new System.Collections.Generic.Dictionary<int, string>();
                foreach (var key in (dict as JSONObject).Keys)
                {
                    var value = dict[key].AsInt;
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
                // no heartbeat
                return;
            }

            ShouldHeartbeat = true;
        }

        void HeartbeatCheck()
        {
            if (HeartbeatInterval == 0) return;

            if (!Client.IsConnected)
            {
                HeartbeatPassed = 0;
                return;
            }

            var dt = Time.unscaledDeltaTime;

            HeartbeatPassed += dt;

            if (ShouldHeartbeat)
            {
                if (HeartbeatPassed > HeartbeatInterval)
                {
                    Client.SendBuffer(Package.SimplePack(PackageType.Heartbeat));
                    Log.D("SendHeartbeat RenewHeartbeatTimeout");
                    RenewHeartbeatTimeout();
                }
                return;
            }

            if (HeartbeatPassed > HeartbeatTimeout)
            {
                Log.D("Pinus Server Heartbeat Timeout");
                if (ReconnectAttempt < MaxReconnectAttempts)
                {
                    Reconnecting = true;
                    ReconnectAttempt++;
                    Connect();
                }
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

            Log.D("Pinus Recv", routeStr, "Data Length", bodyLength);
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
            }

            EventDispatcher.Dispatch(routeStr, bb);
        }

        void OnKick(byte[] data, int offset, int length)
        {
            var d = Protocol.StrDecode(data, offset, length);
            Log.D("Pinus Network OnKick", d);

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

        public void Connect(string url, bool autoReconnect = true)
        {
            Url = url;
            AutoReconnect = autoReconnect;
            Connect();
        }

        protected void Connect()
        {
            DoDisconnect();

            Client.Connect();
        }

        public void Disconnect()
        {
            AutoReconnect = false;
            DoDisconnect();
        }

        protected void DoDisconnect()
        {
            HandshakeEnded = false;
            Reconnecting = false;
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
            Log.D("Pinus Network SendMessage", "route", route, "requestId", requestId, "data length", msg.Length - msg.Position);
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