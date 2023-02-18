using System;
using System.Collections.Generic;
using UnityEngine.Profiling;

namespace XPool
{
    public class AnyPool<T> where T : class, new()
    {
        private PoolCounter Counter = PoolCounter.Start;

        readonly Queue<T> m_Pool;

        public int PoolLength => m_Pool.Count;

        public AnyPool()
        {
            m_Pool = new Queue<T>(Counter.MaxCount);
        }

        /// <summary>
        /// The array length is not always accurate.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public T Rent()
        {
            if (m_Pool.Count != 0)
            {
                Profiler.BeginSample("AnyPool.Rent Dequeue");
                var queueT = m_Pool.Dequeue();
                Profiler.EndSample();
                return queueT;
            }

            Profiler.BeginSample("AnyPool.Rent Alloc");
            var allocT = new T();
            Profiler.EndSample();
            return allocT;
        }

        /// <summary>
        /// <para> Return the array to the pool. </para>
        /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
        /// </summary>
        /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
        public void Return(T any)
        {
            if (any == null) return;

            var resized = RuntimeHelpers.BeforePoolPushResize(m_Pool, ref Counter);
            m_Pool.Enqueue(any);
            if (resized)
            {
                Log.W("AnyPool", typeof(T).Name, "resized to", Counter.MaxCount);
            }
        }

        /// <summary>
        /// <para> Return the array to the pool and set array reference to null. </para>
        /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
        /// </summary>
        /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
        public void Return(ref T any)
        {
            Return(any);
            any = null;
        }

        public static readonly AnyPool<T> Shared = new AnyPool<T>();

        public static T Get()
        {
            return Shared.Rent();
        }

        public static void Release(T any)
        {
            Shared.Return(any);
        }
    }

    public abstract class XAny<T> : IDisposable where T : XAny<T>, new()
    {
        public static T Get()
        {
            return AnyPool<T>.Get();
        }

        public virtual void Dispose() { AnyPool<T>.Release(this as T); }
    }
}