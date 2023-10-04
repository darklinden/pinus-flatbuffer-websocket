using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using UnityEngine;

namespace XPool
{
    public class GameObjectPool : MonoBehaviour
    {
        public int CreateLimitPerFrame = 10;
        public GameObjectPoolHideType HideType { get; set; } = GameObjectPoolHideType.Active;
        [SerializeField, ReadOnly] private string Pool_Name = "";

#if UNITY_EDITOR && DEBUG
        [SerializeField, ReadOnly] private int Pool_Count = 0;
        [SerializeField, ReadOnly] private int Spawn_Count = 0;
#endif

        private Transform m_transform = null;
        public Transform Transform => m_transform == null ? m_transform = transform : m_transform;

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
            switch (HideType)
            {
                case GameObjectPoolHideType.Active:
                    go.SetActive(false);
                    break;
                case GameObjectPoolHideType.Layer:
                    SetLayerRecursively(go, 31);
                    break;
                case GameObjectPoolHideType.UIAlpha:
                    {
                        var cg = go.GetComponent<CanvasGroup>();
                        if (cg != null)
                        {
                            cg.alpha = 0f;
                            cg.blocksRaycasts = false;
                        }
                    }
                    break;
            }
        }

        private void ShowObject(GameObject go)
        {
            switch (HideType)
            {
                case GameObjectPoolHideType.Active:
                    go.SetActive(true);
                    break;
                case GameObjectPoolHideType.Layer:
                    SetLayerRecursively(go, Prefab.layer);
                    break;
                case GameObjectPoolHideType.UIAlpha:
                    {
                        var cg = go.GetComponent<CanvasGroup>();
                        if (cg != null)
                        {
                            cg.alpha = 1f;
                            cg.blocksRaycasts = true;
                        }
                    }
                    break;
            }
        }

        public static GameObjectPool CreateInstance(Transform parent = null)
        {
            var go = new GameObject("GameObjectPool"); // create a new game object
            var gt = go.transform;
            if (parent != null)
            {
                gt.SetParent(parent, false);
                if (parent.GetComponent<RectTransform>() != null)
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
            var instance = go.AddComponent<GameObjectPool>();
            return instance;
        }

        internal int Type { get; set; }
        public string Addr { get; set; }
        public GameObject Prefab { get; private set; }
        public bool IsInitialized => Prefab != null;
        private Queue<GameObject> Pooled { get; set; } // the pool
        public HashSet<GameObject> Spawned { get; set; } // the pool

        public void Initialize<T>(T prefab, string addr = null) where T : Component
        {
            if (prefab == null)
            {
                Log.E("GameObjectPool.Initialize", typeof(T).Name, " prefab is null");
                return;
            }

            Initialize(prefab.gameObject, addr);
        }

        public void Initialize(GameObject prefab, string addr = null)
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

            Pool_Name = prefab.name;

#if XPOOL_LOG
            Log.D("GameObjectPool.Initialize", Pool_Name);
#endif

            if (Prefab != prefab)
            {
                Prefab = prefab;
                Addr = addr;
                if (Pooled != null)
                {
                    foreach (var go in Pooled)
                    {
                        Destroy(go);
                    }
                }
                else
                {
                    Pooled = new Queue<GameObject>();
                }
                if (Spawned != null)
                {
                    foreach (var hash_go in Spawned)
                    {
                        Destroy(hash_go);
                    }
                }
                else
                {
                    Spawned = new HashSet<GameObject>();
                }
            }
        }

        public void Deinitialize()
        {

#if XPOOL_LOG
            Log.D("GameObjectPool.Deinitialize", Pool_Name);
#endif

            if (Prefab == null)
            {
                Log.W("GameObjectPool.Deinitialize", Pool_Name, " Deinitialize twice");
                return;
            }

            Prefab = null;
            if (Pooled != null)
            {
                foreach (var go in Pooled)
                {
                    Destroy(go);
                }
                Pooled.Clear();
            }
            Pooled = null;
            if (Spawned != null)
            {
                foreach (var hash_go in Spawned)
                {
                    Destroy(hash_go);
                }
                Spawned.Clear();
            }
            Spawned = null;

            if (string.IsNullOrEmpty(Addr) == false)
            {
                // LoadUtil.Release(Addr);
                Addr = null;
            }
        }

        public async UniTask PrewarmAsync(int count)
        {
            if (Prefab == null)
            {
                Log.E("GameObjectPool.PrewarmAsync prefab is null");
                return;
            }

            if (count <= 0)
            {
                Log.E("GameObjectPool.PrewarmAsync count <= 0");
                return;
            }

            if (Pooled == null)
            {
                Pooled = new Queue<GameObject>();
            }

            if (Spawned == null)
            {
                Spawned = new HashSet<GameObject>();
            }

            var limit = CreateLimitPerFrame;
            for (int i = 0; i < count; i++)
            {
                var go = Instantiate(Prefab);
                HideObject(go);
                go.transform.SetParent(Transform);
                Pooled.Enqueue(go);

                limit--;
                if (limit <= 0)
                {
                    limit = CreateLimitPerFrame;
                    await UniTask.Yield();
                }
            }
        }

        public GameObject Get()
        {
            if (Prefab == null)
            {
                Log.W("GameObjectPool.Get prefab is null. Maybe Deinitialize called");
                return null;
            }

            GameObject go = null;

            if (Pooled.Count > 0)
            {
                while (go == null && Pooled.Count > 0)
                {
                    go = Pooled.Dequeue();
                }
            }

            if (go == null)
            {
                go = Instantiate(Prefab);
            }

            if (go != null)
            {
                ShowObject(go);
                go.transform.SetParent(Transform);
                RectTransform grt = null;
                if ((grt = go.GetComponent<RectTransform>()) != null)
                {
                    grt.localPosition = Vector3.zero;
                    grt.localRotation = Quaternion.identity;
                    grt.localScale = Vector3.one;
                }
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

        public void ResetObjectForReturn(GameObject go)
        {
            if (go == null) return;

            HideObject(go);
            go.transform.SetParent(Transform);
            // go.transform.localPosition = Vector3.zero;
            // go.transform.localRotation = Prefab.transform.localRotation;
            // go.transform.localScale = Prefab.transform.localScale;
        }

        public void Return<T>(T t) where T : Component
        {
            Return(t.gameObject);
        }

        public void Return(GameObject obj)
        {
            if (Spawned != null && Spawned.Remove(obj))
            {
                ResetObjectForReturn(obj);
                Pooled.Enqueue(obj);
            }
            else if (Pooled.Contains(obj))
            {
                Log.W("GameObjectPool.Release", "object is already released", obj.name);
            }
            else
            {
                Log.W("GameObjectPool.Release", "object is not spawned by this pool", obj.name);
                Object.Destroy(obj);
            }

#if UNITY_EDITOR && DEBUG
            Pool_Count = Pooled.Count;
            Spawn_Count = Spawned.Count;
#endif
        }

        public void ReturnAll()
        {
            if (Spawned != null && Spawned.Count > 0)
            {
                foreach (var hash_go in Spawned)
                {
                    ResetObjectForReturn(hash_go);
                    Pooled.Enqueue(hash_go);
                }
                Spawned.Clear();

#if UNITY_EDITOR && DEBUG
                Pool_Count = Pooled.Count;
                Spawn_Count = Spawned.Count;
#endif
            }
        }
    }
}