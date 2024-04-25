using System;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using UnityEngine.Profiling;

namespace XPool
{
    public class AnyPool<T> where T : class, new()
    {
        // static
        public static string TypeName = typeof(T).Name;

        // instance
        public int PoolCapacity { get; set; } = 256;
        readonly Queue<T> m_Pool;
        public int PoolLength => m_Pool.Count;
        private readonly Func<T> m_Factory;

        public AnyPool(int capacity, Func<T> factory)
        {
            if (capacity > 0)
                PoolCapacity = capacity;
            m_Pool = new Queue<T>(PoolCapacity);
            m_Factory = factory;
        }

        /// <summary>
        /// The array length is not always accurate.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public T GetAny()
        {
            if (m_Pool.Count != 0)
            {
                Profiler.BeginSample("AnyPool.GetAny Dequeue");
                var queueT = m_Pool.Dequeue();
                Profiler.EndSample();
                return queueT;
            }

            Profiler.BeginSample("AnyPool.GetAny Alloc");
            var allocT = m_Factory.Invoke();
            Profiler.EndSample();
            return allocT;
        }

        /// <summary>
        /// <para> Return the array to the pool. </para>
        /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
        /// </summary>
        /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
        public void ReturnAny(T any)
        {
            if (any == null) return;

            if (PoolLength < PoolCapacity)
            {
                m_Pool.Enqueue(any);
            }
            else
            {
                // If the pool is full, we will not return the array to the pool.
                Log.W("AnyPool ReturnAny Out Of Stack", TypeName, PoolCapacity);
            }
        }

        public void Clear()
        {
            m_Pool.Clear();
        }

        /// <summary>
        /// <para> Return the array to the pool and set array reference to null. </para>
        /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
        /// </summary>
        /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
        public void ReturnAny(ref T any)
        {
            ReturnAny(any);
            any = null;
        }

        private static AnyPool<T> m_Shared = null;
        public static AnyPool<T> Shared
        {
            get
            {
                if (m_Shared == null)
                {
                    m_Shared = new AnyPool<T>(-1, () => new T());
                }
                return m_Shared;
            }
        }

        public static AnyPool<T> SharedInit(int capacity, Func<T> factory)
        {
            if (m_Shared != null)
            {
                Log.W("AnyPool SharedInit already initialized");
                return Shared;
            }
            m_Shared = new AnyPool<T>(capacity, factory);
            return m_Shared;
        }

        public static T Get()
        {
            return Shared.GetAny();
        }

        public static void Return(T any)
        {
            Shared.ReturnAny(any);
        }

        public async UniTask PrewarmAsync(int count, int limitPerFrame = 66)
        {
            var prewarmCount = limitPerFrame;
            for (int i = 0; i < count; i++)
            {
                ReturnAny(GetAny());
                prewarmCount--;
                if (prewarmCount <= 0)
                {
                    prewarmCount = limitPerFrame;
                    await UniTask.Yield();
                }
            }
        }
    }
}