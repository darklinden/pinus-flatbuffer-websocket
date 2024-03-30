#if !UNITY_WEBGL || (UNITY_EDITOR && !UNITY_WEBSOCKET_WEBGL_IMPL) 
// 非WebGL平台使用此实现 或 编辑器下, 且未指定使用WebGL实现, 使用此实现

using System.Collections.Generic;
using UnityEngine;

namespace UnityWebSocket
{
    [DefaultExecutionOrder(-10000)]
    internal class WebSocketManager : MonoBehaviour
    {
        private const string rootName = "[UnityWebSocket]";
        private static WebSocketManager _instance;
        public static WebSocketManager Instance
        {
            get
            {
                if (!_instance) CreateInstance();
                return _instance;
            }
        }

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
        }

        public static void CreateInstance()
        {
            GameObject go = GameObject.Find("/" + rootName);
            if (!go) go = new GameObject(rootName);
            if (!go.TryGetComponent<WebSocketManager>(out _instance))
                _instance = go.AddComponent<WebSocketManager>();
        }

        private readonly List<WebSocket> sockets = new List<WebSocket>();

        public void Add(WebSocket socket)
        {
            if (!sockets.Contains(socket))
                sockets.Add(socket);
        }

        public void Remove(WebSocket socket)
        {
            if (sockets.Contains(socket))
                sockets.Remove(socket);
        }

        private void Update()
        {
            if (sockets.Count <= 0) return;
            for (int i = sockets.Count - 1; i >= 0; i--)
            {
                sockets[i].Update();
            }
        }
    }
}
#endif