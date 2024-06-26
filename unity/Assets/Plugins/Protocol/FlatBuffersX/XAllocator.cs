/*
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

using System;
using XPool;

namespace Google.FlatBuffers
{
    public sealed class XAllocator : ByteBufferAllocator
    {
        public XAllocator()
        {
            _buffer = null;
            Length = 0;
        }

        public override void Clear()
        {
            ArrayPool<byte>.Shared.Return(ref _buffer);
            Length = 0;
        }

        public override void Resize(int initialSize)
        {
            if (Buffer == null || Buffer.Length < initialSize)
            {
                ArrayPool<byte>.Shared.Return(ref _buffer);
                _buffer = ArrayPool<byte>.Shared.Get(initialSize);
            }
            Length = Buffer.Length;
        }

        public override void SetBytes(byte[] bytes)
        {
            _buffer = bytes;
            Length = bytes.Length;
        }

        private byte[] _buffer = null;
        public override byte[] Buffer { get => _buffer; protected set => _buffer = value; }

        public override void GrowFront(int newSize)
        {
            if ((Length & 0xC0000000) != 0)
                throw new Exception(
                    "ByteBuffer: cannot grow buffer beyond 2 gigabytes.");

            if (newSize < Length)
                throw new Exception("ByteBuffer: cannot truncate buffer.");

            // Rent new and copy
#if XPOOL_LOG
            var oldeLength = Length;
#endif
            var newBuffer = ArrayPool<byte>.Shared.Get(newSize);
            if (_buffer != null)
            {
                if (Length > 0 && newSize > Length)
                {
                    System.Buffer.BlockCopy(_buffer, 0, newBuffer, newSize - Length, Length);
                }

                // Return old
                ArrayPool<byte>.Shared.Return(ref _buffer);
            }

#if XPOOL_LOG
            Log.D("XAllocator Resize bytes", oldeLength, "->", newBuffer.Length);
#endif

            // Set new
            _buffer = newBuffer;
            Length = newBuffer.Length;
        }
    }
}
