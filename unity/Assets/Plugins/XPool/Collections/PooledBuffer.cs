using System.IO;
using System;

namespace XPool
{
    public class XBuffer : IDisposable
    {
        private static readonly ArrayPool<byte> BytesPool = new ArrayPool<byte>();

        private byte[] m_bytes;
        private int m_Count;

        public int Length => m_Count;
        public int Capacity => m_bytes.Length;
        public byte[] Bytes => m_bytes;

        public XBuffer()
        {
            m_bytes = null;
            m_Count = 0;
        }

        public void SetBytesFromMemoryStream(MemoryStream ms)
        {
            if (ms == null) return;
            if (ms.Length == 0) return;
            if (m_bytes == null || m_bytes.Length < ms.Length)
            {
                BytesPool.Return(ref m_bytes);
                m_bytes = BytesPool.Get((int)ms.Length);
            }
            ms.Read(m_bytes, 0, (int)ms.Length);
            m_Count = (int)ms.Length;
        }

        internal void Write(byte[] data, int dataOffset, int dataLength, int index)
        {
            var totalLength = index + dataLength;
            if (m_bytes == null || m_bytes.Length < totalLength)
            {
                BytesPool.Return(ref m_bytes);
                m_bytes = BytesPool.Get(totalLength);
            }
            System.Buffer.BlockCopy(data, dataOffset, m_bytes, index, dataLength);
            // Array.Copy(data, dataOffset, m_bytes, index, dataLength);
            m_Count = totalLength;
        }

        internal void Write(string str, int index)
        {
            var dataLength = index + str.Length;
            if (m_bytes == null || m_bytes.Length < dataLength)
            {
                BytesPool.Return(ref m_bytes);
                m_bytes = BytesPool.Get(dataLength);
            }
            // fill json utf-8 bytes
            System.Text.Encoding.UTF8.GetBytes(str, 0, str.Length, m_bytes, index);
            m_Count = dataLength;
        }

        internal void Write(byte b, int index)
        {
            var dataLength = index + 1;
            if (m_bytes == null || m_bytes.Length < dataLength)
            {
                BytesPool.Return(ref m_bytes);
                m_bytes = BytesPool.Get(dataLength);
            }
            m_bytes[index] = b;
            if (m_Count < dataLength) m_Count = dataLength;
        }

        internal void Resize(int count)
        {
            if (m_bytes == null || m_bytes.Length < count)
            {
                BytesPool.Return(ref m_bytes);
                m_bytes = BytesPool.Get(count);
            }
            m_Count = count;
        }

        public void Clear()
        {
            BytesPool.Return(ref m_bytes, !RuntimeHelpers.IsWellKnownNoReferenceContainsType<byte>());

            m_bytes = null;
            m_Count = 0;
        }

        public void Dispose()
        {
#if XPOOL_LOG
            Log.D("PooledBuffer Dispose");
#endif
            Clear();
            AnyPool<XBuffer>.Return(this);
        }

        public static XBuffer Get()
        {
            var buffer = AnyPool<XBuffer>.Get();
            return buffer;
        }
    }
}