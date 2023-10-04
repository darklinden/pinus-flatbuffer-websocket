using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.Profiling;

namespace XPool
{
    public partial class XList<T> : IEnumerable<T>, IList<T>, IDisposable
    {
        public static XList<T> Get()
        {
            return AnyPool<XList<T>>.Get();
        }

        public static XList<T> Get(int minimumCapacity)
        {
            var list = AnyPool<XList<T>>.Get();
            list.ResetCapacity(minimumCapacity);
            return list;
        }

        public static XList<T> CopyFrom(IList<T> list)
        {
            var l = Get();
            if (list != null) l.Copy(list);
            return l;
        }

        public XList()
        {
            m_Array = null;
            m_Count = 0;
        }

        public void ResetCapacity(int minimumCapacity)
        {
            ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, minimumCapacity, ArrayPool<T>.Shared);
        }

        private T[] m_Array;
        private int m_Count;
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
#if XPOOL_LOG
                if (index >= m_Count)
                {
                    Log.W("XList.this[int index]", "index >= m_Count");
                }
#endif

                if (!(m_Array != null && index >= 0 && index < m_Array.Length))
                {
                    Log.E("XList", typeof(T).Name, "get_Item Index Out Of Range", index, m_Count);
                }
                return m_Array[index];
            }
            set
            {
                // resize if necessary
                if (index >= m_Array.Length)
                {
#if XPOOL_LOG
                    var oldLen = m_Array == null ? 0 : m_Array.Length;
#endif
                    ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, index + 1, ArrayPool<T>.Shared);
#if XPOOL_LOG
                    Log.W("XList", typeof(T).Name, "set_Item Index Out Of Range Trigger Resize", index, oldLen, "->", m_Array.Length);
#endif
                }
                // set count if necessary
                if (index >= m_Count) m_Count = index + 1;
                m_Array[index] = value;
            }
        }

        /// <summary>
        /// Whether the specified object exists in the list.
        /// </summary>
        public bool Contains(T item)
        {
            return IndexOf(item) != -1;
        }

        /// <summary>
        /// Add object to the head of the list.
        /// </summary>
        public void Add(T item)
        {
            // If the array is full, double the size of the array.
            if (m_Array == null || m_Count == m_Array.Length)
            {
                ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, m_Count * 2, ArrayPool<T>.Shared);
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

        public XList<T> Copy(T one)
        {
            ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, 1, ArrayPool<T>.Shared);
            m_Array[0] = one;
            m_Count = 1;
            return this;
        }

        public void Copy(IList<T> list)
        {
            if (list == null)
            {
                Clear();
                return;
            }
            ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, list.Count, ArrayPool<T>.Shared);
            for (int i = 0; i < list.Count; i++)
            {
                m_Array[i] = list[i];
            }
            m_Count = list.Count;
        }

        public void Fill(T v, int offset, int length)
        {
            var count = offset + length;
            if (m_Count < count)
            {
                ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, count, ArrayPool<T>.Shared);
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
            if (m_Array == null || max >= m_Array.Length)
            {
                ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, m_Array.Length * 2, ArrayPool<T>.Shared);
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

                ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, m_Count + count, ArrayPool<T>.Shared);
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
            if (m_Array != null)
            {
                System.Array.Clear(m_Array, 0, m_Count);
            }
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return;
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
            if (m_Array == null) return;
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
            if (m_Array == null) return;
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
            if (m_Array == null) return;
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return -1;
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
            if (m_Array == null) return default(T);
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
            if (m_Array == null) return default(T);
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
        public XList<T> FindAll(Predicate<T> match)
        {
            if (m_Array == null) return null;
            if (match == null) return null;
            XList<T> result = Get();
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
            if (m_Array == null) return false;
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
            ArrayPoolUtility.EnsureFixedCapacity(ref m_Array, m_Count + 1, ArrayPool<T>.Shared);
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

        public void Dispose()
        {
            ArrayPool<T>.Shared.Return(m_Array, !RuntimeHelpers.IsWellKnownNoReferenceContainsType<T>());

            m_Array = null;
            m_Count = 0;
            AnyPool<XList<T>>.Return(this);
        }
    }
}