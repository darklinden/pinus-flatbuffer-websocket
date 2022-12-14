using System;
using System.Collections.Generic;
using UnityEngine;

namespace PinusUnity
{
    public class EventBus : MonoBehaviour
    {
        private static EventBus _instance = null;
        public static EventBus Instance
        {
            get
            {
                if (!_instance) CreateInstance();
                return _instance;
            }
        }

        private static void CreateInstance()
        {
            GameObject go = GameObject.Find("/[Pinus-Event-Manager]");
            if (go == null) go = new GameObject("[Pinus-Event-Manager]");
            UnityEngine.Object.DontDestroyOnLoad(go);
            _instance = go.GetComponent<EventBus>();
            if (_instance == null) _instance = go.AddComponent<EventBus>();
        }

        public event Event.FrameUpdated OnFrameUpdated;
        private void Update()
        {
            if (OnFrameUpdated != null) OnFrameUpdated();
        }

        public event Event.Connected OnConnected;
        public void Connected(string url)
        {
            if (OnConnected != null) OnConnected(url);
        }

        public event Event.Reconnected OnReconnected;
        public void Reconnected(string url)
        {
            if (OnReconnected != null) OnReconnected(url);
        }

        public event Event.Closed OnClosed;
        public void Closed(string url)
        {
            if (OnClosed != null) OnClosed(url);
        }

        public event Event.Error OnError;
        public void Error(string url, string e)
        {
            if (OnError != null) OnError(url, e);
        }

        public event Event.HandshakeError OnHandshakeError;
        public void HandshakeError(string url, string e)
        {
            if (OnHandshakeError != null) OnHandshakeError(url, e);
        }

        public event Event.HandshakeOver OnHandshakeOver;
        public void HandshakeOver(string url)
        {
            if (OnHandshakeOver != null) OnHandshakeOver(url);
        }

        public event Event.BeenKicked OnBeenKicked;
        public void BeenKicked(string url)
        {
            if (OnBeenKicked != null) OnBeenKicked(url);
        }
    }
}

