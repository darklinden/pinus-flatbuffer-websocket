using System;
using UnityWebSocket;

namespace PinusUnity
{
    internal interface INetworkHandler
    {
        public void ConnectTimeout();
        public void OnOpen();
        public void OnRecv(PooledBuffer data);
        public void OnError(string err);
        public void OnClose();
    }
}
