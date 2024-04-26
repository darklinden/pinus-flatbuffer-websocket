using System;
using UnityWebSocket;
using XPool;

namespace PinusUnity
{
    internal interface INetworkHandler
    {
        public void ConnectTimeout();
        public void OnOpen();
        public void OnRecv(XBuffer data);
        public void OnError(string err);
        public void OnClose(ushort code, string reason);
    }
}
