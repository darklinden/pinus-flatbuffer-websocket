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
    public sealed class ByteArrayAllocator : IByteBufferAllocator
    {
        internal static readonly ArrayPool<byte> BytesPool = new ArrayPool<byte>();

        public ByteArrayAllocator()
        {
            _buffer = null;
            Length = 0;
        }

        public void Clear()
        {
            BytesPool.Return(ref _buffer);
            Length = 0;
        }

        public void Resize(int initialSize)
        {
            if (Buffer == null || Buffer.Length < initialSize)
            {
                BytesPool.Return(ref _buffer);
                _buffer = BytesPool.Rent(initialSize);
            }
            Length = Buffer.Length;
        }

        public void SetBytes(byte[] bytes)
        {
            _buffer = bytes;
            Length = bytes.Length;
        }

        private byte[] _buffer = null;
        public byte[] Buffer { get => _buffer; }
        public int Length { get; set; }

        public void GrowFront(int newSize)
        {
            if ((Length & 0xC0000000) != 0)
                throw new Exception(
                    "ByteBuffer: cannot grow buffer beyond 2 gigabytes.");

            if (newSize < Length)
                throw new Exception("ByteBuffer: cannot truncate buffer.");

            // Rent new and copy
            var newBuffer = BytesPool.Rent(newSize);
            System.Buffer.BlockCopy(_buffer, 0, newBuffer, newBuffer.Length - Length, Length);

            // Return old
            BytesPool.Return(ref _buffer);

            // Set new
            _buffer = newBuffer;
            Length = newBuffer.Length;
        }
    }
}
