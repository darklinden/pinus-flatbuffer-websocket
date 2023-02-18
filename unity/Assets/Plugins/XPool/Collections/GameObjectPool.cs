using System.Collections.Generic;
using UnityEngine;

namespace XPool
{
    public class GameObjectPool : MonoBehaviour
    {
        public GameObjectPoolHideType HideType { get; set; } = GameObjectPoolHideType.Active;

#if UNITY_EDITOR && DEBUG
        [SerializeField, ReadOnly] private int Pool_Count = 0;
        [SerializeField, ReadOnly] private int Spawn_Count = 0;
#endif

        private void AddChildrenToListRecursively(List<Transform> list, Transform parent)
        {
            foreach (Transform item in parent)
            {
                list.Add(item);
                AddChildrenToListRecursively(list, item);
            }
        }

        List<Transform> m_listToSetLayerRecursively = new List<Transform>();
        private void SetLayerRecursively(GameObject go, int layer)
        {
            go.layer = layer;

            m_listToSetLayerRecursively.Clear();
            AddChildrenToListRecursively(m_listToSetLayerRecursively, go.transform);
            foreach (var item in m_listToSetLayerRecursively)
            {
                item.gameObject.layer = layer;
            }
        }

        private void HideObject(GameObject go)
        {
            if (HideType == GameObjectPoolHideType.Active)
            {
                go.SetActive(false);
            }
            else if (HideType == GameObjectPoolHideType.Layer)
            {
                SetLayerRecursively(go, 31);
            }
        }

        private void ShowObject(GameObject go)
        {
            if (HideType == GameObjectPoolHideType.Active)
            {
                go.SetActive(true);
            }
            else if (HideType == GameObjectPoolHideType.Layer)
            {
                SetLayerRecursively(go, Prefab.layer);
            }
        }

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
            // go.transform.localPosition = Vector3.zero;
            // go.transform.localRotation = Quaternion.identity;
            // go.transform.localScale = Vector3.one;
            var instance = go.AddComponent<GameObjectPool>();
            return instance;
        }

        internal int Type { get; set; }
        public string Addr { get; set; }
        public GameObject Prefab { get; private set; }
        private XList<GameObject> Pooled { get; set; } // the pool
        private XList<GameObject> Spawned { get; set; } // the pool

        public void Initialize<T>(T prefab, int capacity = 1, string addr = null) where T : Component
        {
            if (prefab == null)
            {
                Log.E("GameObjectPool.Initialize", typeof(T).Name, " prefab is null");
                return;
            }

            Initialize(prefab.gameObject, capacity, addr);
        }

        public void Initialize(GameObject prefab, int capacity = 1, string addr = null)
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
            Addr = addr;
            if (Pooled != null)
            {
                foreach (var go in Pooled)
                {
                    Destroy(go);
                }
                Pooled.Dispose();
            }
            Pooled = XList<GameObject>.Get(capacity);
            if (Spawned != null)
            {
                foreach (var go in Spawned)
                {
                    Destroy(go);
                }
                Spawned.Dispose();
            }
            Spawned = XList<GameObject>.Get(capacity);
        }

        public void Deinitialize()
        {
            if (Prefab == null)
            {
                Log.E("GameObjectPool.Deinitialize", " Deinitialize twice");
                return;
            }

            Prefab = null;
            LoadUtil.Release(Addr);
            Addr = null;
            if (Pooled != null)
            {
                foreach (var go in Pooled)
                {
                    Destroy(go);
                }
                Pooled.Dispose();
            }
            Pooled = null;
            if (Spawned != null)
            {
                foreach (var go in Spawned)
                {
                    Destroy(go);
                }
                Spawned.Dispose();
            }
            Spawned = null;
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
                go.SetActive(true);
                go.transform.SetParent(transform);
                // go.transform.localPosition = Vector3.zero;
                // go.transform.localRotation = Prefab.transform.localRotation;
                // go.transform.localScale = Prefab.transform.localScale;
                Spawned.Add(go);
            }

#if UNITY_EDITOR && DEBUG
            Pool_Count = Pooled.Count;
            Spawn_Count = Spawned.Count;
#endif
            return go;
        }

        public void ResetObjectForRelease(GameObject go)
        {
            if (go == null) return;

            go.SetActive(false);
            go.transform.SetParent(transform);
            // go.transform.localPosition = Vector3.zero;
            // go.transform.localRotation = Prefab.transform.localRotation;
            // go.transform.localScale = Prefab.transform.localScale;
        }


        public void Release<T>(T t) where T : Component
        {
            Release(t.gameObject);
        }

        public void Release(GameObject obj)
        {
            if (Spawned.Remove(obj))
            {
                ResetObjectForRelease(obj);
                Pooled.Add(obj);
            }
            else
            {
                Log.W("GameObjectPool.Release", "object is not spawned by this pool");
                Object.Destroy(obj);
            }

#if UNITY_EDITOR && DEBUG
            Pool_Count = Pooled.Count;
            Spawn_Count = Spawned.Count;
#endif
        }

        public void ReleaseAll()
        {
            if (Spawned != null && Spawned.Count > 0)
            {
                for (int i = Spawned.Count - 1; i >= 0; i--)
                {
                    var go = Spawned[i];
                    ResetObjectForRelease(go);
                    Pooled.Add(go);
                    Spawned.RemoveAt(i);
                }
#if UNITY_EDITOR && DEBUG
                Pool_Count = Pooled.Count;
                Spawn_Count = Spawned.Count;
#endif
            }
        }

        internal void DestroyAll()
        {
            if (Spawned != null && Spawned.Count > 0)
            {
#if UNITY_EDITOR && DEBUG
                Pool_Count = 0;
                Spawn_Count = 0;
#endif
                for (int i = Spawned.Count - 1; i >= 0; i--)
                {
                    var go = Spawned[i];
                    Object.Destroy(go);
                }
                Spawned = null;

                for (int i = Pooled.Count - 1; i >= 0; i--)
                {
                    var go = Pooled[i];
                    Object.Destroy(go);
                }
                Pooled = null;
            }
        }

        private void OnApplicationQuit()
        {
            DestroyAll();
        }

        private void OnDestroy()
        {
            DestroyAll();
        }
    }
}