using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using UnityEngine;

namespace XPool
{
    public class GameObjectTypedPool : MonoBehaviour
    {
        private GameObjectPoolHideType m_hideType = GameObjectPoolHideType.Active;
        public GameObjectPoolHideType HideType
        {
            get
            {
                return m_hideType;
            }
            set
            {
                m_hideType = value;
                if (Pools != null)
                {
                    foreach (var pool in Pools)
                    {
                        pool.Value.HideType = value;
                    }
                }
            }
        }

        public static GameObjectTypedPool CreateInstance(Transform parent, string name)
        {
            var go = new GameObject(name); // create a new game object
            var gt = go.transform;
            if (parent != null)
            {
                gt.SetParent(parent);
                if (parent.TryGetComponent<RectTransform>(out var _))
                {
                    gt = go.AddComponent<RectTransform>();
                }
            }
            else if (Application.isPlaying)
            {
                DontDestroyOnLoad(go);
            }
            gt.localPosition = Vector3.zero;
            gt.localRotation = Quaternion.identity;
            gt.localScale = Vector3.one;
            var instance = go.AddComponent<GameObjectTypedPool>();
            return instance;
        }

        private Dictionary<int, GameObjectPool> Pools { get; set; } // the pool 

        [SerializeField] private bool _isInitialized = false;
        public bool IsInitialized => _isInitialized;
        public void Initialize(int capacity = 1)
        {
            if (Pools == null)
            {
                Pools = new Dictionary<int, GameObjectPool>(capacity);
#if XPOOL_LOG
                Log.D("GameObjectTypedPool.Initialize", gameObject.name, "Create Pool");
#endif
            }
            else
            {
#if XPOOL_LOG
                Log.E("GameObjectTypedPool.Initialize", gameObject.name, "Pool Is Already Initialized");
#endif
            }

            _isInitialized = true;
        }

        public void DeinitializeAll()
        {
            _isInitialized = false;
#if XPOOL_LOG
            Log.D("GameObjectTypedPool.DeinitializeAll", gameObject.name);
#endif
            if (Pools != null)
            {
                foreach (var pool in Pools.Values)
                {
                    pool.Deinitialize();
                    Destroy(pool.gameObject);
                }

                Pools.Clear();
                Pools = null;
            }
        }

        public async UniTask PrewarmAsync(int type, int count)
        {
            if (Pools.TryGetValue(type, out var pool))
            {
                await pool.PrewarmAsync(count);
            }
            else
            {
                Log.E("GameObjectTypedPool.PrewarmAsync", gameObject.name, "Pool Not Found", type);
            }
        }

        public void SetPrefab<T>(int type, T prefab, string addr = null) where T : Component
        {
            if (prefab == null)
            {
                Log.E("GameObjectTypedPool.SetPrefab", typeof(T).Name, " prefab is null", type);
                return;
            }

            SetPrefab(type, prefab.gameObject, addr);
        }

        public void SetPrefab(int type, GameObject prefab, string addr = null)
        {
            if (prefab == null)
            {
                Log.E("GameObjectTypedPool.SetPrefab", "prefab is null", type);
                return;
            }

            if (Pools.TryGetValue(type, out var pool))
            {
                pool.Initialize(prefab, addr);
                pool.HideType = HideType;
            }
            else
            {
                pool = GameObjectPool.CreateInstance(transform);
                pool.Initialize(prefab, addr);
                pool.HideType = HideType;
                Pools.Add(type, pool);
            }
        }

        public GameObject GetPrefab(int type)
        {
            if (!Pools.TryGetValue(type, out var pool))
            {
                Log.E("GameObjectTypedPool.GetPrefab", "Pool Is Not Initialized", type);
                return null;
            }

            return pool.Prefab;
        }

        public bool HasPool(int type)
        {
            if (Pools.TryGetValue(type, out var pool))
            {
                return pool.IsInitialized;
            }

            return false;
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

        public void Return<T>(T t, int type) where T : Component
        {
            Return(t.gameObject, type);
        }

        public void Return(GameObject obj, int type)
        {
            if (!Pools.TryGetValue(type, out var pool))
            {
                Log.E("GameObjectTypedPool.Get", "Pool Is Not Initialized", type);
                Destroy(obj);
                return;
            }

            pool.Return(obj);
        }

        public void ReturnAll(int type)
        {
            if (Pools.TryGetValue(type, out var pool))
            {
                pool?.ReturnAll();
            }
        }

        public void ReturnAll()
        {
            if (Pools == null)
            {
                return;
            }
            foreach (var pool in Pools.Values)
            {
                pool.ReturnAll();
            }
        }
    }
}