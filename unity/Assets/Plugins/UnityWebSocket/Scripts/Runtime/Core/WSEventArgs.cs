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

    public class WSEventArgs : EventArgs, IRelease
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
                if (m_Pool.Count != 0) return m_Pool.Pop();

                return new WSEventArgs();
            }

            public void Return(WSEventArgs buffer)
            {
                if (buffer == null) return;
                if (m_Pool.Count < kMaxBucketSize)
                {
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
        public PooledBuffer Data { get; internal set; }

        int RetainCount { get; set; }
        int IRelease.RetainCount { get => RetainCount; set => RetainCount = value; }

        public static WSEventArgs Create()
        {
            var args = Shared.Rent();
            args.RetainCount = 0;
            return args;
        }

        private void DoRelease()
        {
            Log.D("WSEventArgs DoRelease");
            if (Data != null)
            {
                Data.Release();
                Data = null;
            }
            Shared.Return(this);
        }

        void IRelease.DoRelease() => DoRelease();
    }
}
