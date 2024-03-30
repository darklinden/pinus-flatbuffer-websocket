using System;
namespace PinusUnity
{
    public static class Event
    {
        public delegate void FrameUpdated();
        public delegate void Connected(string url);
        public delegate void Reconnected(string url);
        public delegate void Closed(string url, ushort closeCode, string closeReason);
        public delegate void Error(string url, string e);
        public delegate void HandshakeError(string url, string e);
        public delegate void HandshakeOver(string url);
        public delegate void BeenKicked(string url);
    }
}