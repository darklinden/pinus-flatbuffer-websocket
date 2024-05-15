
using System;
using UnityEngine;
using XPool;

namespace Google.FlatBuffers
{
    public partial class ByteBuffer : IDisposable
    {
        public ByteBuffer()
        {
            _buffer = new XAllocator();
            _pos = 0;
        }

        public static ByteBuffer GetAny()
        {
            var buffer = AnyPool<ByteBuffer>.Get();
            return buffer;
        }

        public void Dispose()
        {
            _buffer.Clear();
            _pos = 0;
            AnyPool<ByteBuffer>.Return(this);
        }


        public void CopyBytes(byte[] bytes, int pos, int length)
        {
            _buffer.Resize(length);
            _pos = _buffer.Length - length;
            System.Buffer.BlockCopy(bytes, pos, _buffer.Buffer, _pos, length);
        }

        public void Resize(int initialSize)
        {
            _buffer.Resize(initialSize);
        }

        public void CopyTo(XBuffer dst, int dstPos)
        {
            dst.Write(_buffer.Buffer, Position, Length - Position, dstPos);
        }
    }
}
