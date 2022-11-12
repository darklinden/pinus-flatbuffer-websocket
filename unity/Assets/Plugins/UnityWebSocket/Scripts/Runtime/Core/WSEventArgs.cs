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
        public class Pool
        {
            private const int kMaxBucketSize = 64;

            private readonly Stack<WSEventArgs> m_Pool;

            public Pool()
            {
                m_Pool = new Stack<WSEventArgs>();
            }

            public WSEventArgs Rent()
            {
                if (m_Pool.Count != 0)
                {
                    Log.D("WSEventArgs Pop", m_Pool.Count);
                    return m_Pool.Pop();
                }

                Log.D("WSEventArgs New");
                return new WSEventArgs();
            }

            public void Return(WSEventArgs buffer)
            {
                if (buffer == null) return;
                if (m_Pool.Count < kMaxBucketSize)
                {
                    Log.D("WSEventArgs Push", m_Pool.Count);
                    m_Pool.Push(buffer);
                }
                else
                {
                    Log.E("WSEventArgs Pool is full");
                }
            }

            public void Return(ref WSEventArgs buffer)
            {
                Return(buffer);
                buffer = null;
            }
        }

        public static readonly Pool Shared = new Pool();

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
            var args = Shared.Rent();
            return args;
        }

        public void Dispose()
        {
            Log.D("WSEventArgs Dispose");
            if (Data != null)
            {
                Data.Dispose();
                Data = null;
            }
            Shared.Return(this);
        }
    }
}
