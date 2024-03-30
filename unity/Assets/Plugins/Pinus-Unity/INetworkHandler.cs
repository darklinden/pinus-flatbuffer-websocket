using System;
using UnityWebSocket;

namespace PinusUnity
{
    internal interface INetworkHandler
    {
        public void ConnectTimeout();
        public void OnOpen();
        public void OnRecv(XPool.XBuffer data);
        public void OnError(string err);
        public void OnClose(ushort code, string reason);
    }
}
