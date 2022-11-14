using UnityEngine;

namespace XPool
{
    public class GameObjectPool : MonoBehaviour
    {
        public static GameObjectPool CreateInstance(Transform parent = null)
        {
            var go = new GameObject("GameObjectPool"); // create a new game object
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
            var instance = go.AddComponent<GameObjectPool>();
            return instance;
        }

        internal int Type { get; set; }
        private GameObject Prefab { get; set; }
        private XList<GameObject> Pooled { get; set; } // the pool
        private XList<GameObject> Spawned { get; set; } // the pool

        public void Initialize<T>(T prefab, int capacity = 1) where T : Component
        {
            if (prefab == null)
            {
                Log.E("GameObjectPool.Initialize", typeof(T).Name, " prefab is null");
                return;
            }

            Initialize(prefab.gameObject, capacity);
        }

        public void Initialize(GameObject prefab, int capacity = 1)
        {
            if (prefab == null)
            {
                Log.E("GameObjectPool.Initialize", " prefab is null");
                return;
            }

            if (Prefab != null)
            {
                Log.E("GameObjectPool.Initialize", " Initialize twice");
                return;
            }

            Prefab = prefab;
            Pooled = XList<GameObject>.Get(capacity);
            Spawned = XList<GameObject>.Get(capacity);
        }

        public GameObject Get()
        {
            if (Prefab == null)
            {
                Log.E("GameObjectPool.Get prefab is null");
                return null;
            }

            GameObject go = null;

            if (Pooled.Count > 0)
            {
                while (go == null && Pooled.Count > 0)
                {
                    go = Pooled[0];
                    Pooled.RemoveAt(0);
                }
            }

            if (go == null)
            {
                go = Instantiate(Prefab);
            }

            if (go != null)
            {
                ResetObject(go);
                Spawned.Add(go);
            }

            return go;
        }

        public void ResetObject(GameObject go)
        {
            if (go == null)
            {
                Log.E("GameObjectPool.ResetObject", "go is null");
                return;
            }

            go.transform.SetParent(transform);
            go.transform.localPosition = Vector3.zero;
            go.transform.localRotation = Quaternion.identity;
            go.transform.localScale = Vector3.one;
        }


        public void Release<T>(T t) where T : Component
        {
            Release(t.gameObject);
        }

        public void Release(GameObject obj)
        {
            if (Spawned.Remove(obj))
            {
                ResetObject(obj);
                Pooled.Add(obj);
            }
            else
            {
                Log.E("GameObjectPool.Release", "object is not spawned by this pool");
                Object.Destroy(obj);
            }
        }

        public void ReleaseAll()
        {
            for (int i = Spawned.Count - 1; i >= 0; i--)
            {
                var go = Spawned[i];
                ResetObject(go);
                Pooled.Add(go);
                Spawned.RemoveAt(i);
            }
        }
    }
}