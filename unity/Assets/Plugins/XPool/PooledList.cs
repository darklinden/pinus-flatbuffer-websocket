using System;
using System.Collections;
using System.Collections.Generic;

namespace XPool
{
    public partial class PooledList<T> : IEnumerable<T>, IList<T>, IRelease
    {
        public class Pool
        {
            const int kMaxBucketSize = 64 * 10;

            public static readonly Pool Shared = new Pool();

            ArrayPool<T> m_ArrayPool;

            readonly Stack<PooledList<T>> m_Pool;

            public Pool()
            {
                m_ArrayPool = ArrayPool<T>.Shared;
                m_Pool = new Stack<PooledList<T>>();
            }

            public Pool(ArrayPool<T> arrayPool)
            {
                m_ArrayPool = arrayPool ?? ArrayPool<T>.Shared;
                m_Pool = new Stack<PooledList<T>>();
            }

            /// <summary>
            /// The array length is not always accurate.
            /// </summary>
            /// <exception cref="ArgumentOutOfRangeException"></exception>
            public PooledList<T> Rent(int minimumCapacity = 0)
            {
                if (minimumCapacity < 0) minimumCapacity = 0;

                if (m_Pool.Count != 0)
                {
                    // Log.D("PooledList Rent from pool");
                    return m_Pool.Pop();
                }

                return new PooledList<T>(this, ArrayPool<T>.Shared, minimumCapacity);
            }

            /// <summary>
            /// <para> Return the array to the pool. </para>
            /// <para> The length of the array must be greater than or equal to 8 and a power of 2. </para>
            /// </summary>
            /// <param name="array"> The length of the array must be greater than or equal to 8 and a power of 2. </param>
            public void Return(PooledList<T> list)
            {
                if (list == null) return;
                list.Clear();
                if (m_Pool.Count < kMaxBucketSize)
                {
                    m_Pool.Push(list);
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
            public void Return(ref PooledList<T> list)
            {
                Return(list);
                list = null;
            }

            public void ReleaseInstances(int keep)
            {
                if (keep < 0) keep = 0;
                if (keep > kMaxBucketSize) keep = kMaxBucketSize;

                if (keep > 0)
                {
                    // Release instances from each buckets.
                    for (int k = m_Pool.Count - keep; k > 0; k--)
                    {
                        m_Pool.Pop();
                    }
                }
                else
                {
                    m_Pool.Clear();
                }
            }
        }

        public static PooledList<T> Create(int minimumCapacity = 0)
        {
            return Pool.Shared.Rent(minimumCapacity);
        }

        public static PooledList<T> CopyFrom(IList<T> list)
        {
            return Pool.Shared.Rent(list.Count).Copy(list);
        }

        public static PooledList<T> CopyFrom(T one)
        {
            return Pool.Shared.Rent(1).Copy(one);
        }

        public static void Release(ref PooledList<T> list)
        {
            Pool.Shared.Return(ref list);
        }

        public static void Release(PooledList<T> list)
        {
            Pool.Shared.Return(list);
        }

        private T[] m_Array;
        private int m_Count;
        private ArrayPool<T> m_ArrayPool;
        private Pool m_ListPool;

        public int Count => m_Count;

        /// <summary>
        /// Length of internal array.
        /// </summary>
        public int Capacity => m_Array.Length;

        /// <summary>
        /// <para> Internal array. </para>
        /// <para> The length of internal array is always greater than or equal to <see cref="Length"/> property. </para>
        /// </summary>
        public T[] Array => m_Array;

        public bool IsReadOnly { get => false; }

        public T this[int index]
        {
            get
            {
                Log.AssertIsTrue(index >= 0 && index < m_Count, "PooledList<T>.get_Item", "index out of range", index, m_Count);
                return m_Array[index];
            }
            set
            {
                Log.AssertIsTrue(index >= 0 && index < m_Array.Length, "PooledList<T>.set_Item", "index out of range", index, m_Count);
                if (index >= m_Count && index < m_Array.Length)
                {
                    m_Count = index + 1;
                }
                m_Array[index] = value;
            }
        }

        public PooledList(Pool listPool, ArrayPool<T> arrayPool, int minimumCapacity)
        {
            m_ListPool = listPool ?? Pool.Shared;
            m_ArrayPool = arrayPool ?? ArrayPool<T>.Shared;
            m_Array = arrayPool.Rent(minimumCapacity);
            m_Count = 0;
        }

        /// <summary>
        /// Whether the specified object exists in the list.
        /// </summary>
        public bool Contains(T item)
        {
            if (item == null)
            {
                for (int i = 0; i < m_Count; i++)
                {
                    if (item == null)
                    {
                        return true;
                    }
                }
                return false;
            }
            else if (item is IEquatable<T> ei)
            {
                var comparer = EqualityComparer<T>.Default;
                for (int i = 0; i < m_Count; i++)
                {
                    if (ei.Equals(m_Array[i]))
                    {
                        return true;
                    }
                }
                return false;
            }
            else
            {
                var comparer = EqualityComparer<T>.Default;
                for (int i = 0; i < m_Count; i++)
                {
                    if (comparer.Equals(m_Array[i], item))
                    {
                        return true;
                    }
                }
                return false;
            }
        }

        /// <summary>
        /// Add object to the head of the list.
        /// </summary>
        public void Add(T item)
        {
            // If the array is full, double the size of the array.
            if (m_Count == m_Array.Length)
            {
                ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, m_Count * 2, m_ArrayPool);
            }
            m_Array[m_Count] = item;
            m_Count++;
        }

        /// <summary>
        /// Add elements of specified collection to the head of the list.
        /// </summary>
        /// <param name="collection"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public void AddRange(IEnumerable<T> collection)
        {
            InsertRange(m_Count, collection);
        }

        public PooledList<T> Copy(T one)
        {
            ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, 1, m_ArrayPool);
            m_Array[0] = one;
            m_Count = 1;
            return this;
        }

        public PooledList<T> Copy(IList<T> list)
        {
            ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, list.Count, m_ArrayPool);
            for (int i = 0; i < list.Count; i++)
            {
                m_Array[i] = list[i];
            }
            m_Count = list.Count;
            return this;
        }

        public void Fill(T v, int offset, int length)
        {
            var count = offset + length;
            if (m_Count < count)
            {
                ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, count, m_ArrayPool);
            }
            for (int i = offset; i < count; i++)
            {
                m_Array[i] = v;
            }
            if (m_Count < count) m_Count = count;
        }

        /// <summary>
        /// Insert object at the specified index in the list.
        /// </summary>
        /// <param name="index"></param>
        /// <param name="item"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public void Insert(int index, T item)
        {
            var max = Math.Max(m_Count + 1, index + 1);
            if (max >= m_Array.Length)
            {
                ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, m_Array.Length * 2, m_ArrayPool);
            }

            if (index < m_Count)
            {
                System.Array.Copy(m_Array, index, m_Array, index + 1, m_Count - index);
            }

            m_Array[index] = item;
            m_Count++;
        }

        /// <summary>
        /// Insert elements of specified collection to the specified index in the list.
        /// </summary>
        /// <param name="index"></param>
        /// <param name="collection"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public void InsertRange(int index, IEnumerable<T> collection)
        {
            if (collection == null)
            {
                return;
            }
            if (collection is ICollection<T> c)
            {
                int count = c.Count;

                ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, m_Count + count, m_ArrayPool);
                if (index < m_Count)
                {
                    System.Array.Copy(m_Array, index, m_Array, index + count, m_Count - index);
                }

                c.CopyTo(m_Array, index);

                m_Count += count;
            }
            else
            {
                foreach (T item in collection)
                {
                    Insert(index, item);
                    index++;
                }
            }
        }

        /// <summary>
        /// Remove the first matching element when the specified object exists in the list.
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        public bool Remove(T item)
        {
            int index = IndexOf(item);
            if (index >= 0)
            {
                RemoveAt(index);
                return true;
            }
            return false;
        }

        /// <summary>
        /// Remove object at the specified index in the list.
        /// </summary>
        /// <param name="index"></param>
        /// <returns></returns>
        public bool RemoveAt(int index)
        {
            if (index >= m_Count)
            {
                return false;
            }
            m_Count--;
            if (index < m_Count)
            {
                System.Array.Copy(m_Array, index + 1, m_Array, index, m_Count - index);
            }
            m_Array[m_Count] = default;
            return true;
        }

        void IList<T>.RemoveAt(int index)
        {
            RemoveAt(index);
        }

        /// <summary>
        /// Remove objects in the list within specified range from specified index.
        /// </summary>
        /// <param name="index"></param>
        /// <param name="count"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        /// <exception cref="ArgumentException"></exception>
        public void RemoveRange(int index, int count)
        {
            if (index < 0) index = 0;
            if (count < 0) count = 0;
            if ((m_Count - index) < count) count = m_Count - index;

            if (count > 0)
            {
                m_Count -= count;
                if (index < m_Count)
                {
                    System.Array.Copy(m_Array, index + count, m_Array, index, m_Count - index); ;
                }
                System.Array.Clear(m_Array, m_Count, count);
            }
        }

        /// <summary>
        /// Remove all objects from the list that match the speficied condition.
        /// </summary>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public int RemoveAll(Predicate<T> match)
        {
            if (match == null) return 0;

            int freeIndex = 0;
            while (freeIndex < m_Count && !match(m_Array[freeIndex]))
            {
                freeIndex++;
            }
            if (freeIndex >= m_Count)
            {
                return 0;
            }

            int current = freeIndex + 1;
            while (current < m_Count)
            {
                while (current < m_Count && match(m_Array[current]))
                {
                    current++;
                }
                if (current < m_Count)
                {
                    m_Array[freeIndex++] = m_Array[current++];
                }
            }

            System.Array.Clear(m_Array, freeIndex, m_Count - freeIndex);
            int result = m_Count - freeIndex;
            m_Count = freeIndex;
            return result;
        }

        /// <summary>
        /// Remove all objects from the list.
        /// </summary>
        public void Clear()
        {
            m_ArrayPool.Return(m_Array, !RuntimeHelpers.IsWellKnownNoReferenceContainsType<T>());

            m_Array = m_ArrayPool.Rent(0);
            m_Count = 0;
        }

        #region IndexOf

        /// <summary>
        /// Search for specified object in the list and return the index of the first matching element.
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        public int IndexOf(T item)
        {
            return System.Array.IndexOf(m_Array, item, 0, m_Count);
        }

        /// <summary>
        /// Search for specified object in the list at between specified index and the tail, and return the index of the first matching element.
        /// </summary>
        /// <param name="item"></param>
        /// <param name="index"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public int IndexOf(T item, int index)
        {
            if (index > m_Count) return -1;
            return System.Array.IndexOf(m_Array, item, index, m_Count - index);
        }

        /// <summary>
        /// Search for specified object in the list within specified range from specified index, and return the index of the first matching element.
        /// </summary>
        /// <param name="item"></param>
        /// <param name="index"></param>
        /// <param name="count"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public int IndexOf(T item, int index, int count)
        {
            if (index > m_Count) return -1;
            if ((count < 0) || index > (m_Count - count)) return -1;
            return System.Array.IndexOf(m_Array, item, index, count);
        }

        #endregion

        #region LastIndexOf

        /// <summary>
        /// Search for specified object in the list and return the index of the last matching element.
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        public int LastIndexOf(T item)
        {
            if (m_Count == 0) return -1;
            return LastIndexOf(item, m_Count - 1, m_Count);
        }

        /// <summary>
        /// Search for specified object in the list at between specified index and the tail, and return the index of the last matching element.
        /// </summary>
        /// <param name="item"></param>
        /// <param name="index"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public int LastIndexOf(T item, int index)
        {
            if (index >= m_Count) return -1;
            return LastIndexOf(item, index, index + 1);
        }

        /// <summary>
        /// Search for specified object in the list within specified range from specified index, and return the index of the first matching element.
        /// </summary>
        /// <param name="item"></param>
        /// <param name="index"></param>
        /// <param name="count"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public int LastIndexOf(T item, int index, int count)
        {
            if (m_Count == 0) return -1;
            if (index >= m_Count) return -1;
            return System.Array.LastIndexOf(m_Array, item, index, count);
        }

        #endregion

        #region BinarySearch

        /// <summary>
        /// Search a sorted list using the default comparer and return the index starting from 0 for that element.
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        public int BinarySearch(T item)
        {
            return BinarySearch(0, m_Count, item, null);
        }

        /// <summary>
        /// Search in the sorted list within specified range from specified index, using the specified comparer and return the index starting from 0 for that element.
        /// </summary>
        /// <param name="item"></param>
        /// <param name="comparer"></param>
        /// <returns></returns>
        public int BinarySearch(T item, IComparer<T> comparer)
        {
            return BinarySearch(0, m_Count, item, comparer);
        }

        /// <summary>
        /// Search a sorted list using the specified comparer and return the index starting from 0 for that element.
        /// </summary>
        /// <param name="index"></param>
        /// <param name="count"></param>
        /// <param name="item"></param>
        /// <param name="comparer"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public int BinarySearch(int index, int count, T item, IComparer<T> comparer)
        {
            if (index < 0) index = 0;
            if (count < 0) count = 0;
            if (m_Count < index + count) count = m_Count - index;
            return System.Array.BinarySearch(m_Array, index, count, item, comparer);
        }

        #endregion

        #region CopyTo

        /// <summary>
        /// Copy objects to array in the list.
        /// </summary>
        /// <param name="array"></param>
        public void CopyTo(T[] array)
        {
            CopyTo(array, 0);
        }

        /// <summary>
        /// Copy objects to array in the list.
        /// </summary>
        /// <param name="array"></param>
        /// <param name="arrayIndex"></param>
        /// <exception cref="ArgumentException"></exception>
        public void CopyTo(T[] array, int arrayIndex)
        {
            System.Array.Copy(m_Array, 0, array, arrayIndex, m_Count);
        }

        /// <summary>
        /// Copy objects to array in the list.
        /// </summary>
        /// <param name="index"></param>
        /// <param name="array"></param>
        /// <param name="arrayIndex"></param>
        /// <param name="count"></param>
        /// <exception cref="ArgumentException"></exception>
        public void CopyTo(int index, T[] array, int arrayIndex, int count)
        {
            if (m_Count < index + count) count = m_Count - index;
            System.Array.Copy(m_Array, index, array, arrayIndex, count);
        }

        #endregion

        #region Reverse

        /// <summary>
        /// Reverse the order of the elements in the list.
        /// </summary>
        public void Reverse()
        {
            Reverse(0, m_Count);
        }

        /// <summary>
        /// Reverse the order of the elements in the list.
        /// </summary>
        /// <param name="index"></param>
        /// <param name="count"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        /// <exception cref="ArgumentException"></exception>
        public void Reverse(int index, int count)
        {
            if (index < 0) index = 0;
            if (count < 0) count = 0;
            if ((m_Count - index) < count) count = m_Count - index;
            System.Array.Reverse(m_Array, index, count);
        }

        #endregion

        #region Sort

        /// <summary>
        /// Sort the elements of the list using the default comparer.
        /// </summary>
        public void Sort()
        {
            Sort(0, m_Count, null);
        }

        /// <summary>
        /// Sort the elements of the list using the specified comparer.
        /// </summary>
        /// <param name="comparer"></param>
        public void Sort(IComparer<T> comparer)
        {
            Sort(0, m_Count, comparer);
        }

        /// <summary>
        /// Sort the elements of the list using the specified comparer.
        /// </summary>
        /// <param name="index"></param>
        /// <param name="count"></param>
        /// <param name="comparer"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        /// <exception cref="ArgumentException"></exception>
        public void Sort(int index, int count, IComparer<T> comparer)
        {
            if (index < 0) index = 0;
            if (count < 0) count = 0;
            if ((m_Count - index) < count) count = m_Count - index;
            System.Array.Sort(m_Array, index, count, comparer);
        }

        #endregion

        #region FindIndex

        /// <summary>
        /// Search in the list with specified condition and return the index of the first matching element.
        /// </summary>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public int FindIndex(Predicate<T> match)
        {
            return FindIndex(0, match);
        }

        /// <summary>
        /// Search in the list at between specified index and the tail with specified condition, and return the index of the first matching element.
        /// </summary>
        /// <param name="startIndex"></param>
        /// <param name="match"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        /// <exception cref="ArgumentNullException"></exception>
        public int FindIndex(int startIndex, Predicate<T> match)
        {
            return FindIndex(startIndex, m_Count, match);
        }

        /// <summary>
        /// Search in the list within specified range from specified index with specified condition, and return the index of the first matching element.
        /// </summary>
        /// <param name="startIndex"></param>
        /// <param name="count"></param>
        /// <param name="match"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        /// <exception cref="ArgumentNullException"></exception>
        public int FindIndex(int startIndex, int count, Predicate<T> match)
        {
            if (startIndex < 0) startIndex = 0;
            if (startIndex > m_Count) startIndex = m_Count;
            if (count < 0) count = 0;
            if (m_Count < startIndex + count) count = m_Count - startIndex;
            if (match == null) return -1;

            int endIndex = startIndex + count;
            for (int i = startIndex; i < endIndex; i++)
            {
                if (match(m_Array[i]))
                {
                    return i;
                }
            }
            return -1;
        }

        #endregion

        #region FindLastIndex

        /// <summary>
        /// Search in the list with specified condition and return the index of the last matching element.
        /// </summary>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public int FindLastIndex(Predicate<T> match)
        {
            return FindLastIndex(m_Count - 1, m_Count, match);
        }

        /// <summary>
        /// Search in the list at between specified index and the tail with specified condition, and return the index of the last matching element.
        /// </summary>
        /// <param name="startIndex"></param>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public int FindLastIndex(int startIndex, Predicate<T> match)
        {
            return FindLastIndex(startIndex, startIndex + 1, match);
        }

        /// <summary>
        /// Search in the list within specified range from specified index with specified condition, and return the index of the last matching element.
        /// </summary>
        /// <param name="startIndex"></param>
        /// <param name="count"></param>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public int FindLastIndex(int startIndex, int count, Predicate<T> match)
        {
            if (startIndex < 0) startIndex = 0;
            if (startIndex > m_Count) startIndex = m_Count;
            if (count < 0) count = 0;
            if (m_Count < startIndex + count) count = m_Count - startIndex;
            if (match == null) return -1;

            int endIndex = startIndex - count;
            if (endIndex < 0) return -1;
            for (int i = startIndex; i > endIndex; i--)
            {
                if (match(m_Array[i]))
                {
                    return i;
                }
            }
            return -1;
        }

        #endregion

        /// <summary>
        /// Whether the object matching the specified condition exists in the list.
        /// </summary>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public bool Exists(Predicate<T> match)
        {
            return FindIndex(match) != -1;
        }

        /// <summary>
        /// Search in the list with specified condition and return the first matching element.
        /// </summary>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public T Find(Predicate<T> match)
        {
            if (match == null) return default(T);
            for (int i = 0; i < m_Count; i++)
            {
                T item = m_Array[i];
                if (match(item))
                {
                    return item;
                }
            }
            return default;
        }

        /// <summary>
        /// Search in the list with specified condition and return the last matching element.
        /// </summary>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public T FindLast(Predicate<T> match)
        {
            if (match == null) return default(T);
            for (int i = m_Count - 1; i >= 0; i--)
            {
                T item = m_Array[i];
                if (match(item))
                {
                    return item;
                }
            }
            return default;
        }

        /// <summary>
        /// Return a collection of objects in a list that match the specified condition.
        /// </summary>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public PooledList<T> FindAll(Predicate<T> match)
        {
            if (match == null) return null;
            PooledList<T> result = Pool.Shared.Rent();
            for (int i = 0; i < m_Count; i++)
            {
                T item = m_Array[i];
                if (match(item))
                {
                    result.Add(item);
                }
            }
            return result;
        }

        /// <summary>
        /// Whether all objects in the list match the specified condition.
        /// </summary>
        /// <param name="match"></param>
        /// <exception cref="ArgumentNullException"></exception>
        public bool TrueForAll(Predicate<T> match)
        {
            if (match == null) return false;
            for (int i = 0; i < m_Count; i++)
            {
                if (!match(m_Array[i]))
                {
                    return false;
                }
            }
            return true;
        }

        public IEnumerator<T> GetEnumerator()
        {
            for (int i = 0; i < m_Count; i++)
            {
                yield return m_Array[i];
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();


        // stack 

        /// <summary>
        /// Add object to the head of the stack.
        /// </summary>
        /// <param name="item"> Object to add to the stack. </param>
        public void Push(T item)
        {
            ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, m_Count + 1, m_ArrayPool);
            m_Array[m_Count] = item;
            m_Count++;
        }

        /// <summary>
        /// Remove object at the head of the stack and returns it. If the stack is empty, <see cref="InvalidOperationException"/> will be thrown.
        /// </summary>
        /// <exception cref="InvalidOperationException"></exception>
        public T Pop()
        {
            if (m_Count == 0) throw new InvalidOperationException("Stack is empty.");
            T item = m_Array[m_Count - 1];
            m_Array[m_Count - 1] = default;
            m_Count--;
            return item;
        }

        /// <summary>
        /// Return object at the head of the stack. If the stack is empty, <see cref="InvalidOperationException"/> will be thrown.
        /// </summary>
        /// <exception cref="InvalidOperationException"></exception>
        public T Peek()
        {
            if (m_Count == 0) throw new InvalidOperationException("Stack is empty.");
            return m_Array[m_Count - 1];
        }


        int RetainCount { get; set; }
        int IRelease.RetainCount { get => RetainCount; set => RetainCount = value; }

        void DoRelease()
        {
            Clear();
            m_ListPool.Return(this);
        }

        void IRelease.DoRelease() => DoRelease();
    }
}