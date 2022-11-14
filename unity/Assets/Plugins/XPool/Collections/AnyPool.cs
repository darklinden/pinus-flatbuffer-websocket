using System;
using System.Collections.Generic;
using UnityEngine.Profiling;

namespace XPool
{
    public class AnyPool<T> where T : class
    {
        private StackCounter StackCounter = StackCounter.Start;

        readonly Stack<T> m_Pool;

        public AnyPool()
        {
            m_Pool = new Stack<T>(StackCounter.MaxCount);
        }

        /// <summary>
        /// The array length is not always accurate.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public T Rent()
        {
            if (m_Pool.Count != 0)
            {
                return m_Pool.Pop();
            }

            Profiler.BeginSample("AnyPool.Rent Alloc");
            var allocT = Activator.CreateInstance<T>();
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

            var resized = RuntimeHelpers.BeforeStackPushResize(m_Pool, ref StackCounter);
            m_Pool.Push(any);
            if (resized)
            {
                Log.W("AnyPool", typeof(T).Name, "resized to", StackCounter.MaxCount);
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

        private static readonly AnyPool<T> Shared = new AnyPool<T>();

        public static T Get()
        {
            return Shared.Rent();
        }

        public static void Release(T any)
        {
            Shared.Return(any);
        }
    }
}