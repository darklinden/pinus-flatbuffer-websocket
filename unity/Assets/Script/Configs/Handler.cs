using System.Collections.Generic;
using System;
using Cysharp.Threading.Tasks;
using XPool;

namespace FlatConfigs
{
    public partial class Handler
    {
        private static Lazy<Handler> _lazySingletonInstance = new Lazy<Handler>(() => new Handler());
        public static Handler Instance => _lazySingletonInstance.Value;

        private Dictionary<int, List<IConfigLoader>> m_StartLoadersInSort = null;
        private List<int> m_StartLoadSortList = null;

        private Dictionary<int, List<IConfigLoader>> m_DemandLoadersInSort = null;
        private List<int> m_DemandLoadSortList = null;

        public bool IsInitialized { get; private set; } = false;
        public void Initialize()
        {
            if (IsInitialized)
            {
                return;
            }

            m_StartLoadersInSort = new Dictionary<int, List<IConfigLoader>>();
            m_StartLoadSortList = new List<int>();
            m_DemandLoadersInSort = new Dictionary<int, List<IConfigLoader>>();
            m_DemandLoadSortList = new List<int>();

            List<Type> typelist = new List<Type>();

            var namespaceName = this.GetType().Namespace;
            var assembly = this.GetType().Assembly;
            foreach (var type in assembly.GetTypes())
            {
                if (type.Namespace == namespaceName
                    && type.IsClass
                    && typeof(IConfigLoader).IsAssignableFrom(type))
                {
                    // Log.D(type.Namespace, type.Name);
                    typelist.Add(type);
                }
            }

            for (int i = 0; i < typelist.Count; i++)
            {
                var typeInstance = Activator.CreateInstance(typelist[i]);
                if (typeInstance is IConfigLoader)
                {
                    var loader = typeInstance as IConfigLoader;
                    loader.Initialize(this);

                    if (loader.LoadOnStart)
                    {
                        if (!m_StartLoadersInSort.TryGetValue(loader.Priority, out var loaders))
                        {
                            loaders = new List<IConfigLoader>();
                            m_StartLoadersInSort.Add(loader.Priority, loaders);
                            m_StartLoadSortList.Add(loader.Priority);
                        }
                        loaders.Add(loader);
                    }
                    else
                    {
                        if (!m_DemandLoadersInSort.TryGetValue(loader.Priority, out var loaders))
                        {
                            loaders = new List<IConfigLoader>();
                            m_DemandLoadersInSort.Add(loader.Priority, loaders);
                            m_DemandLoadSortList.Add(loader.Priority);
                        }
                        loaders.Add(loader);
                    }
                }
            }

            m_StartLoadSortList.Sort();
            m_DemandLoadSortList.Sort();

            IsInitialized = true;
        }

        public async UniTask AsyncLoadStart()
        {
            // wait for all systems to initialize

            for (int i = 0; i < m_StartLoadSortList.Count; i++)
            {
                var loaders = m_StartLoadersInSort[m_StartLoadSortList[i]];

                var tasks = XList<UniTask>.Get(loaders.Count);
                for (int j = 0; j < loaders.Count; j++)
                {
                    tasks.Add(loaders[j].AsyncLoad());
                }
                await UniTask.WhenAll(tasks);
                tasks.Dispose();
            }
        }

        public async UniTask AsyncLoadDemand()
        {
            // wait for all systems to initialize

            for (int i = 0; i < m_DemandLoadSortList.Count; i++)
            {
                var loaders = m_DemandLoadersInSort[m_DemandLoadSortList[i]];

                var tasks = XList<UniTask>.Get(loaders.Count);
                for (int j = 0; j < loaders.Count; j++)
                {
                    tasks.Add(loaders[j].AsyncLoad());
                }
                await UniTask.WhenAll(tasks);
                tasks.Dispose();
            }
        }

        public async UniTask AsyncLoadAll()
        {
            await UniTask.WhenAll(AsyncLoadStart(), AsyncLoadDemand());
        }
    }
}