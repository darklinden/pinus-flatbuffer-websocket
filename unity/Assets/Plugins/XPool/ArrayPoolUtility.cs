using System;
using XPool;

namespace XPool
{
    public static class ArrayPoolUtility
    {
        public const int kMinArraySize = 8;
        public static void EnsureFixedCapacity<T>(ref T[] array, int fixedSize, ArrayPool<T> pool)
        {
            if (array.Length <= fixedSize)
            {
                // UnityEngine.Debug.Log("ArrayPoolUtility.EnsureCapacity: " + array.Length + " - " + newSize);
                int minimumSize = (array.Length != 0) ? array.Length * 2 : kMinArraySize;
                T[] newArray = pool.Rent((fixedSize < minimumSize) ? minimumSize : fixedSize);
                Array.Copy(array, 0, newArray, 0, array.Length);

                pool.Return(array, !RuntimeHelpers.IsWellKnownNoReferenceContainsType<T>());

                array = newArray;
            }
        }
    }
}