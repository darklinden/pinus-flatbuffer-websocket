using System;
using System.Collections.Generic;
using XPool;

namespace UnityWebSocket
{
    public enum WSEventType
    {
        Open,
        Close,
        Error,
        Message,
    }

    public class WSEventArgs : EventArgs, IDisposable
    {
        public WSEventType EventType { get; internal set; }

        public ushort CloseCode { get; internal set; }
        public CloseStatusCode CloseStatusCode
        {
            get
            {
                if (Enum.IsDefined(typeof(CloseStatusCode), CloseCode))
                    return (CloseStatusCode)CloseCode;
                return CloseStatusCode.Unknown;
            }
        }

        public string CloseReason { get => Message; }
        public string Message { get; internal set; }
        public XPool.XBuffer Data { get; internal set; }

        public static WSEventArgs Get()
        {
            var args = AnyPool<WSEventArgs>.Get();
            return args;
        }

        public void Dispose()
        {
#if UNITY_WEBSOCKET_LOG
            Log.D("WSEventArgs Dispose");
#endif
            if (Data != null)
            {
                Data.Dispose();
                Data = null;
            }
            AnyPool<WSEventArgs>.Release(this);
        }
    }
}
