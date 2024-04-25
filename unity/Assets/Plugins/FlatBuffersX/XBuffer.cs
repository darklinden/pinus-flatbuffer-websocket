using System.IO;
using System;
using XPool;

public class XBuffer : IDisposable
{
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
        EnsureFixedCapacity((int)ms.Length);
        ms.Read(m_bytes, 0, (int)ms.Length);
        m_Count = (int)ms.Length;
    }

    internal void Write(Memory<byte> data, int dataOffset, int dataLength, int index)
    {
        var totalLength = index + dataLength;
        EnsureFixedCapacity(totalLength);
        data.Span.Slice(dataOffset, dataLength).CopyTo(m_bytes.AsSpan(index));
        m_Count = totalLength;
    }

    internal void Write(byte[] data, int dataOffset, int dataLength, int index)
    {
        var totalLength = index + dataLength;
        EnsureFixedCapacity(totalLength);
        Buffer.BlockCopy(data, dataOffset, m_bytes, index, dataLength);
        m_Count = totalLength;
    }

    internal void Write(string str, int index)
    {
        var dataLength = index + str.Length;
        EnsureFixedCapacity(dataLength);
        // fill json utf-8 bytes
        System.Text.Encoding.UTF8.GetBytes(str, 0, str.Length, m_bytes, index);
        m_Count = dataLength;
    }

    internal void Write(byte b, int index)
    {
        var dataLength = index + 1;
        EnsureFixedCapacity(dataLength);
        m_bytes[index] = b;
        if (m_Count < dataLength) m_Count = dataLength;
    }

    internal void EnsureFixedCapacity(int count)
    {
        if (m_bytes == null || m_bytes.Length < count)
        {
            // 从池中取出新的数组
            var newBytes = ArrayPool<byte>.Shared.Get(count);
            if (m_bytes != null)
            {
                // 将旧数组的数据拷贝到新数组
                Buffer.BlockCopy(m_bytes, 0, newBytes, 0, m_Count);
                // 将旧数组归还到池中
                ArrayPool<byte>.Shared.Return(ref m_bytes);
            }
            m_bytes = newBytes;
        }
    }

    internal void Resize(int count)
    {
        EnsureFixedCapacity(count);
        m_Count = count;
    }

    public void Clear()
    {
        ArrayPool<byte>.Shared.Return(ref m_bytes, !RuntimeHelpers.IsWellKnownNoReferenceContainsType<byte>());

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
