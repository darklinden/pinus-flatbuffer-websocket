using System;
using System.Collections.Generic;
using UnityEngine;
using Google.FlatBuffers;
using SimpleJSON;

namespace PinusUnity
{
    public class Network : INetworkHandler
    {
        const int RES_OK = 200;
        const int RES_FAIL = 500;
        const int RES_OLD_CLIENT = 501;

        // --- instances begin ---

        protected static Dictionary<string, Network> _instances = new Dictionary<string, Network>();

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
        protected Dictionary<int, string> m_RequestRouteMap = new Dictionary<int, string>();

        // callback from request id
        protected Dictionary<int, Action<ByteBuffer>> m_RequestCallbackMap = new Dictionary<int, Action<ByteBuffer>>();

        protected Dictionary<string, int> m_RouteMap = null;
        protected Dictionary<int, string> m_RouteMapBack = null;

        protected Network(string key)
        {
            Client = new Client(this);
            EventBus.Instance.OnFrameUpdated -= HeartbeatCheck;
            EventBus.Instance.OnFrameUpdated += HeartbeatCheck;
        }

        // --- Socket begin ---
        private static byte[] m_HandshakeBuffer = null;
        private static byte[] HandshakeBuff
        {
            get
            {
                if (m_HandshakeBuffer == null)
                {
                    var offset = Package.PKG_HEAD_BYTES;
                    var str = "{\"sys\":{\"type\":\"ws\",\"version\":\"0.0.1\",\"rsa\":{}},\"user\":{}}";
                    // length = Package.PKG_HEAD_BYTES + str.Length
                    var len = offset + str.Length;
                    var handshakeBuff = new byte[len];
                    // fill json utf-8 bytes
                    System.Text.Encoding.UTF8.GetBytes(str, 0, str.Length, handshakeBuff, offset);
                    // fill head
                    Package.Encode(PackageType.Handshake, ref handshakeBuff, len - Package.PKG_HEAD_BYTES);
                    Log.D(handshakeBuff);
                    m_HandshakeBuffer = handshakeBuff;
                }
                return m_HandshakeBuffer;
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

            Client.SendBuffer(HandshakeBuff);
        }

        public void OnRecv(byte[] data)
        {
            ProcessPackage(data);

            // new package arrived, update the heartbeat timeout
            // Utils.L("OnRecv RenewHeartbeatTimeout");
            // RenewHeartbeatTimeout();
        }

        public void OnError(Exception err)
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
            EventBus.Instance.Error(Url, new Exception("Connect Timeout"));
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
            Log.D("OnHandshake", str);
            var json = JSON.Parse(str);

            var code = json.HasKey("code") ? json["code"].AsInt : -1;
            if (code == RES_OLD_CLIENT)
            {
                EventBus.Instance.HandshakeError(Url, new Exception("client version not fullfill"));
                return;
            }

            if (code != RES_OK)
            {
                EventBus.Instance.HandshakeError(Url, new Exception("handshake fail"));
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
                m_RouteMap = new Dictionary<string, int>();
                m_RouteMapBack = new Dictionary<int, string>();
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
                    Utils.L("SendHeartbeat RenewHeartbeatTimeout");
                    RenewHeartbeatTimeout();
                }
                return;
            }

            if (HeartbeatPassed > HeartbeatTimeout)
            {
                Utils.L("Pinus Server Heartbeat Timeout");
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
                    routeStr = m_RequestRouteMap[id];
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

            var bb = new ByteBuffer(bytes);
            bb.Position = bodyOffset;

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

        internal void ProcessPackage(byte[] bytes)
        {
            int offset = 0;
            int length = 0;

            var type = Package.Decode(bytes, ref offset, out length);
            while (type != PackageType.Unknown)
            {
                ProcessMessage(type, bytes, offset, length);
                offset += length;
                type = Package.Decode(bytes, ref offset, out length);
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

        private byte[] m_SendBuffer = new byte[4 * 1024];
        public void SendMessage(int requestId, string route, ByteBuffer msg)
        {
            if (String.IsNullOrEmpty(route))
            {
                Log.E("Pinus Network Notify Error: Empty Route");
                return;
            }

            Utils.L("Pinus Network SendMessage", requestId, route, msg);

            var type = requestId > 0 ? MessageType.REQUEST : MessageType.NOTIFY;

            var routeCode = 0;
            if (!m_RouteMap.TryGetValue(route, out routeCode)) routeCode = 0;

            // encode data to m_SendBuffer
            var dataLen = msg.Length - msg.Position;

            // seed Package header
            var offset = Package.PKG_HEAD_BYTES;

            // encode message header
            if (routeCode == 0)
            {
                Message.Encode(requestId, type, route, ref m_SendBuffer, ref offset);
            }
            else
            {
                Message.Encode(requestId, type, routeCode, ref m_SendBuffer, ref offset);
            }

            // copy data body
            if (dataLen > 0)
            {
                msg.CopyTo(ref m_SendBuffer, offset);
                offset += dataLen;
            }

            // encode package header
            Package.Encode(PackageType.Data, ref m_SendBuffer, offset - Package.PKG_HEAD_BYTES);

            // new buffer to send
            var buffer = new byte[offset];
            System.Buffer.BlockCopy(m_SendBuffer, 0, buffer, 0, offset);

            // send data
            Client.SendBuffer(buffer);
        }

        public void Request(string route, ByteBuffer msg, Action<ByteBuffer> cb = null)
        {
            if (String.IsNullOrEmpty(route))
            {
                Log.E("Pinus Network Request Error: Empty Route");
                return;
            }

            var requestId = GenerateUniqueRequestId();
            SendMessage(requestId, route, msg);
            if (cb != null) m_RequestCallbackMap.Add(requestId, (e) => cb(e));
            m_RequestRouteMap.Add(requestId, route);
        }

        public void Notify(string route, ByteBuffer data)
        {
            if (String.IsNullOrEmpty(route))
            {
                Log.E("Pinus Network Notify Error: Empty Route");
                return;
            }

            SendMessage(0, route, data);
        }
    }
}