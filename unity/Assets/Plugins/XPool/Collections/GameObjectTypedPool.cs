using UnityEngine;

namespace XPool
{
    public class GameObjectTypedPool : MonoBehaviour
    {
        public static GameObjectTypedPool CreateInstance(Transform parent = null)
        {
            var go = new GameObject("GameObjectTypedPool"); // create a new game object
            if (parent != null)
            {
                go.transform.SetParent(parent);
            }
            else if (Application.isPlaying)
            {
                DontDestroyOnLoad(go);
            }
            go.transform.localPosition = Vector3.zero;
            go.transform.localRotation = Quaternion.identity;
            go.transform.localScale = Vector3.one;
            var instance = go.AddComponent<GameObjectTypedPool>();
            return instance;
        }

        private XList<int> Types { get; set; } // the pool types
        private XDictionary<int, GameObjectPool> Pools { get; set; } // the pool 

        public void Initialize(int capacity = 1)
        {
            Types = XList<int>.Get(capacity);
            Pools = XDictionary<int, GameObjectPool>.Get(capacity);
        }

        public void SetPrefab<T>(int type, T prefab) where T : Component
        {
            if (prefab == null)
            {
                Log.E("GameObjectTypedPool.SetPrefab", typeof(T).Name, " prefab is null", type);
                return;
            }

            SetPrefab(type, prefab.gameObject);
        }

        public void SetPrefab(int type, GameObject prefab)
        {
            if (prefab == null)
            {
                Log.E("GameObjectTypedPool.SetPrefab", "prefab is null", type);
                return;
            }

            if (Pools.TryGetValue(type, out var pool))
            {
                pool.Initialize(prefab);
            }
            else
            {
                pool = GameObjectPool.CreateInstance(transform);
                pool.Initialize(prefab);
                Pools.Add(type, pool);
                Types.Add(type);
            }
        }

        public GameObject Get(int type)
        {
            if (!Pools.TryGetValue(type, out var pool))
            {
                Log.E("GameObjectTypedPool.Get", "Pool Is Not Initialized", type);
                return null;
            }

            return pool.Get();
        }

        public void Release<T>(T t, int type) where T : Component
        {
            Release(t.gameObject, type);
        }

        public void Release(GameObject obj, int type)
        {
            if (!Pools.TryGetValue(type, out var pool))
            {
                Log.E("GameObjectTypedPool.Get", "Pool Is Not Initialized", type);
                Destroy(obj);
                return;
            }

            pool.Release(obj);
        }

        public void ReleaseAll(int type)
        {
            if (Pools.TryGetValue(type, out var pool))
            {
                pool?.ReleaseAll();
            }
        }

        public void ReleaseAll()
        {
            foreach (var pool in Pools.Values)
            {
                pool.ReleaseAll();
            }
        }
    }
}