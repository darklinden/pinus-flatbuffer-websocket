using System;
using XPool;

namespace Google.FlatBuffers
{
    public partial class FlatBufferBuilder : IDisposable
    {

        public FlatBufferBuilder()
        {
            _bb = null;
            _space = 0;
            _minAlign = 1;
            _vtableSize = -1;
            _objectStart = 0;
            _numVtables = 0;
            _vectorNumElems = 0;
            _sharedStringMap = null;
        }

        public void SetByteBuffer(ByteBuffer buffer)
        {
            _bb = buffer;
            _space = buffer.Length;
            buffer.Reset();
        }

        private bool IsDisposed = false;

        public static FlatBufferBuilder InstanceDefault
        {
            get
            {
                var builder = AnyPool<FlatBufferBuilder>.Get();
                var bb = ByteBuffer.GetAny();
                builder.SetByteBuffer(bb);
                builder.IsDisposed = false;
                return builder;
            }
        }

        public void Dispose()
        {
            if (IsDisposed)
            {
                return;
            }

            _bb.Dispose();
            _bb = null;
            _space = 0;
            Array.Clear(_vtable, 0, _vtable.Length);
            Array.Clear(_vtables, 0, _vtables.Length);
            _minAlign = 1;
            _vtableSize = -1;
            _objectStart = 0;
            _numVtables = 0;
            _vectorNumElems = 0;
            _sharedStringMap = null;

            IsDisposed = true;
            AnyPool<FlatBufferBuilder>.Return(this);
        }
    }
}
