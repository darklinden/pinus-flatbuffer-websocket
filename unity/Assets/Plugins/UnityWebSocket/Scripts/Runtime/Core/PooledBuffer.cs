﻿using System.IO;
using System;
using System.Collections;
using System.Collections.Generic;
using XPool;

namespace UnityWebSocket
{
    public partial class PooledBuffer : IRelease
    {
        public class Pool
        {
            const int kMaxBucketSize = 64 * 10;

            readonly Stack<PooledBuffer> m_Pool;

            public Pool()
            {
                m_Pool = new Stack<PooledBuffer>();
            }

            /// <summary>
            /// The array length is not always accurate.
            /// </summary>
            /// <exception cref="ArgumentOutOfRangeException"></exception>
            public PooledBuffer Rent()
            {
                if (m_Pool.Count != 0)
                {
                    // Log.D("PooledList Rent from pool");
                    return m_Pool.Pop();
                }

                return new PooledBuffer();
            }

            /// <summary>
            /// <para> Return the array to the pool. </para>
            /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
            /// </summary>
            /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
            public void Return(PooledBuffer buffer)
            {
                if (buffer == null) return;
                buffer.Clear();
                if (m_Pool.Count < kMaxBucketSize)
                {
                    m_Pool.Push(buffer);
                }
                else
                {
                    Log.E("PooledList Pool is full");
                }
            }

            /// <summary>
            /// <para> Return the array to the pool and set array reference to null. </para>
            /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
            /// </summary>
            /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
            public void Return(ref PooledBuffer buffer)
            {
                Return(buffer);
                buffer = null;
            }
        }

        public static readonly ArrayPool<byte> BytesPool = new ArrayPool<byte>();
        public static readonly Pool BufferPool = new Pool();

        private byte[] m_bytes;
        private int m_Count;

        public int Length => m_Count;
        public int Capacity => m_bytes.Length;
        public byte[] Bytes => m_bytes;

        int RetainCount { get; set; }
        int IRelease.RetainCount { get => RetainCount; set => RetainCount = value; }

        public PooledBuffer()
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
                m_bytes = BytesPool.Rent((int)ms.Length);
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
                m_bytes = BytesPool.Rent(totalLength);
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
                m_bytes = BytesPool.Rent(dataLength);
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
                m_bytes = BytesPool.Rent(dataLength);
            }
            m_bytes[index] = b;
            if (m_Count < dataLength) m_Count = dataLength;
        }

        internal void Resize(int count)
        {
            if (m_bytes == null || m_bytes.Length < count)
            {
                BytesPool.Return(ref m_bytes);
                m_bytes = BytesPool.Rent(count);
            }
            m_Count = count;
        }

        public void Clear()
        {
            BytesPool.Return(m_bytes, !RuntimeHelpers.IsWellKnownNoReferenceContainsType<byte>());

            m_bytes = null;
            m_Count = 0;
        }

        private void DoRelease()
        {
            Log.D("PooledBuffer DoRelease");
            Clear();
            BufferPool.Return(this);
        }

        public static PooledBuffer Create()
        {
            var buffer = BufferPool.Rent();
            buffer.RetainCount = 0;
            return buffer;
        }

        void IRelease.DoRelease() => DoRelease();
    }
}