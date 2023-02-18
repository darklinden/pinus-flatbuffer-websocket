using System;
using System.Threading;
using System.Collections.Generic;
using UnityEngine.Profiling;

namespace XPool
{
    public class ArrayPool<T>
    {
        public static readonly ArrayPool<T> Shared = new ArrayPool<T>();

        readonly Queue<T[]>[] m_Pool;
        readonly PoolCounter[] m_StackCounters;

        public ArrayPool()
        {
            m_Pool = new Queue<T[]>[18];
            m_StackCounters = new PoolCounter[18];
            for (int i = 0; i < m_Pool.Length; i++)
            {
                m_StackCounters[i] = PoolCounter.Start;
            }
        }

        /// <summary>
        /// The array length is not always accurate.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public T[] Rent(int minimumLength)
        {
            if (minimumLength < 0) minimumLength = 0;

            if (minimumLength == 0)
            {
                return Array.Empty<T>();
            }

            int size = CalculateArraySize(minimumLength);
            int poolIndex = GetPoolIndex(size);

            if (poolIndex != -1)
            {
                if (m_Pool[poolIndex] == null)
                {
                    Profiler.BeginSample("ArrayPool.Rent Alloc Stack");
                    m_Pool[poolIndex] = new Queue<T[]>(m_StackCounters[poolIndex].MaxCount);
                    Profiler.EndSample();
                }

                Queue<T[]> pool = m_Pool[poolIndex];

                if (pool.Count != 0)
                {
#if XPOOL_LOG
                    Log.D("ArrayPool.Rent Use Pool", pool.Count);
#endif
                    return pool.Dequeue();
                }
            }

#if XPOOL_LOG
            Log.D("ArrayPool.Rent Alloc");
#endif
            Profiler.BeginSample("ArrayPool.Rent Alloc");
            var allocArr = new T[size];
            Profiler.EndSample();
            return allocArr;
        }

        /// <summary>
        /// <para> Return the array to the pool. </para>
        /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
        /// </summary>
        /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
        public void Return(T[] array)
        {
            Return(array, RuntimeHelpers.IsWellKnownNoReferenceContainsType<T>());
        }

        /// <summary>
        /// <para> Return the array to the pool. </para>
        /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
        /// </summary>
        /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
        public void Return(T[] array, bool clearArray = false)
        {
            if ((array == null) || (array.Length == 0))
            {
                return;
            }

            int poolIndex = GetPoolIndex(array.Length);
            if (poolIndex == -1)
            {
                return;
            }

            if (m_Pool[poolIndex] == null)
            {
                Profiler.BeginSample("ArrayPool.Return Alloc Stack");
                m_Pool[poolIndex] = new Queue<T[]>(m_StackCounters[poolIndex].MaxCount);
                Profiler.EndSample();
            }

            Queue<T[]> pool = m_Pool[poolIndex];

            if (clearArray)
            {
                Array.Clear(array, 0, array.Length);
            }

            var resized = RuntimeHelpers.BeforePoolPushResize(pool, ref m_StackCounters[poolIndex]);
            pool.Enqueue(array);

            if (resized)
            {
                Log.W("ArrayPool Return Out Of Stack Trigger Resize", typeof(T).Name, array.Length, m_StackCounters[poolIndex].MaxCount);
            }
        }

        /// <summary>
        /// <para> Return the array to the pool and set array reference to null. </para>
        /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
        /// </summary>
        /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
        public void Return(ref T[] array, bool clearArray = false)
        {
            Return(array, clearArray);
            array = null;
        }

        public void ReleaseInstances(int keep)
        {
            if (keep < 0) keep = 0;

            if (keep > 0)
            {
                // Release instances from each buckets.
                for (int i = 0; i < m_Pool.Length; i++)
                {
                    var bucket = m_Pool[i];
                    for (int k = bucket.Count - keep; i > 0; k--)
                    {
                        bucket.Dequeue();
                    }
                }
            }
            else
            {
                // Release buckets.
                Array.Clear(m_Pool, 0, m_Pool.Length);
            }
        }

        static int CalculateArraySize(int size)
        {
            size--;
            size |= size >> 1;
            size |= size >> 2;
            size |= size >> 4;
            size |= size >> 8;
            size |= size >> 16;
            size += 1;

            if (size < ArrayPoolUtility.kMinArraySize)
            {
                size = ArrayPoolUtility.kMinArraySize;
            }
            return size;
        }

        static int GetPoolIndex(int length)
        {
            switch (length)
            {
                case 8:
                    return 0;
                case 16:
                    return 1;
                case 32:
                    return 2;
                case 64:
                    return 3;
                case 128:
                    return 4;
                case 256:
                    return 5;
                case 512:
                    return 6;
                case 1024:
                    return 7;
                case 2048:
                    return 8;
                case 4096:
                    return 9;
                case 8192:
                    return 10;
                case 16384:
                    return 11;
                case 32768:
                    return 12;
                case 65536:
                    return 13;
                case 131072:
                    return 14;
                case 262144:
                    return 15;
                case 524288:
                    return 16;
                case 1048576:
                    return 17;
                default:
                    return -1;
            }
        }
    }
}