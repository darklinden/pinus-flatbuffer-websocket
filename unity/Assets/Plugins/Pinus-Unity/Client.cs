using System;
using UnityEngine;
using UnityWebSocket;
using XPool;

namespace PinusUnity
{
    public class Client
    {
        protected float m_ConnectTimeout = 30;
        public float ConnectTimeout { get { return m_ConnectTimeout; } set { m_ConnectTimeout = value; } }

        public bool IsConnected { get { return m_Ws != null && m_Ws.ReadyState == WebSocketState.Open; } }
        public string Url = null;

        protected bool m_ManuallyClosed = false;
        protected float m_ConnectPassed = 0;
        protected WebSocket m_Ws = null;
        internal INetworkHandler m_NetworkHandle = null;
        internal Client(INetworkHandler networkHandle)
        {
            m_NetworkHandle = networkHandle;
            m_ManuallyClosed = false;
            m_ConnectPassed = 0;
        }

        public void Connect()
        {
#if PINUS_LOG
            Log.D("Pinus Client Connect", Url);
#endif

            m_Ws = null;
            m_ManuallyClosed = false;

            InitSocket();
        }

        private void InitSocket()
        {
            m_ConnectPassed = 0;
            EventBus.Instance.OnFrameUpdated -= OnFrameUpdated;
            EventBus.Instance.OnFrameUpdated += OnFrameUpdated;

#if PINUS_LOG
            Log.D("Pinus Client InitSocket", Url);
#endif

            try
            {
                m_Ws = new WebSocket(this.Url);
                m_Ws.OnOpen += OnOpen;
                m_Ws.OnClose += OnClose;
                m_Ws.OnError += OnError;
                m_Ws.OnMessage += OnMessage;
                m_Ws.ConnectAsync();
            }
            catch (Exception e)
            {
                Log.E("Pinus Client InitSocket Error", Url);
                m_NetworkHandle.OnError(e.Message);
                Close();
            }
        }

        private void OnOpen(object sender, WSEventArgs e)
        {
            m_ConnectPassed = 0;
            EventBus.Instance.OnFrameUpdated -= OnFrameUpdated;
#if PINUS_LOG
            Log.D("Pinus Client OnOpen", Url);
#endif
            m_NetworkHandle.OnOpen();
        }

        private void OnMessage(object sender, WSEventArgs e)
        {
            m_NetworkHandle.OnRecv(e.Data);
        }

        private void OnError(object sender, WSEventArgs e)
        {
            Log.E("Pinus Client OnError", Url, e.Message);
            if (!m_ManuallyClosed)
            {
                m_NetworkHandle.OnError(e.Message);
            }
            Close();
        }

        private void OnClose(object sender, WSEventArgs e)
        {
#if PINUS_LOG
            Log.D("Pinus Client OnClose", Url);
#endif
            if (!m_ManuallyClosed)
            {
                m_NetworkHandle.OnClose(e.CloseCode, e.CloseReason);
            }
            Close();
        }

        private void OnFrameUpdated()
        {
            m_ConnectPassed += Time.unscaledDeltaTime;
            if (m_ConnectPassed > ConnectTimeout)
            {
                Log.E("Client connect Timeout", Url);
                EventBus.Instance.OnFrameUpdated -= OnFrameUpdated;

                Close();
                m_NetworkHandle.ConnectTimeout();
            }
        }

        public void SendBuffer(XBuffer buffer)
        {
#if PINUS_LOG
            Log.D("Pinus Client SendBuffer", buffer.Length);
#endif
            if (m_Ws != null)
            {
                try
                {
                    m_Ws.SendAsync(buffer);
                }
                catch (Exception e)
                {
                    Log.E("Pinus Client SendBuffer Error", Url, e);

                    Close();
                    m_NetworkHandle.OnError(e.Message);
                }
            }
            else
            {
                if (!m_ManuallyClosed)
                {
                    m_NetworkHandle.OnError(null);
                }
                Close();
            }
        }

        public void Close()
        {
            m_ManuallyClosed = true;
            m_ConnectPassed = 0;
            EventBus.Instance.OnFrameUpdated -= OnFrameUpdated;

            if (m_Ws != null)
            {
                m_Ws.OnOpen -= OnOpen;
                m_Ws.OnClose -= OnClose;
                m_Ws.OnError -= OnError;
                m_Ws.OnMessage -= OnMessage;
                m_Ws.CloseAsync();
                m_Ws = null;
            }
        }
    }
}