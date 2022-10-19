using System.Collections.Generic;
namespace PinusUnity
{
    internal struct HandshakeRecvPackageSys
    {
        public int heartbeat { get; set; }
        public Dictionary<string, int> dict { get; set; }
    }

    internal struct HandshakeRecvPackage
    {
        public int code { get; set; }
        public HandshakeRecvPackageSys sys { get; set; }
    }
}
