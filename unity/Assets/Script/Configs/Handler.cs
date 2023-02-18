using System.Collections.Generic;
using System.Collections;
using System.Reflection;
using System;

namespace FlatConfigs
{
    public partial class Handler
    {
        private static Lazy<Handler> _lazySingletonInstance = new Lazy<Handler>(() => new Handler());
        public static Handler Instance => _lazySingletonInstance.Value;

        public List<IConfigLoader> LoadersLoadOnStart { get; private set; }
        public List<IConfigLoader> LoadersLoadOnDemand { get; private set; }

        public void Initialize()
        {
            LoadersLoadOnStart = new List<IConfigLoader>();
            LoadersLoadOnDemand = new List<IConfigLoader>();

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
                        LoadersLoadOnStart.Add(loader);
                    }
                    else
                    {
                        LoadersLoadOnDemand.Add(loader);
                    }
                }
            }
        }

        public IEnumerator RoutineLoadStart()
        {
            for (int i = 0; i < LoadersLoadOnStart.Count; i++)
            {
                yield return LoadersLoadOnStart[i].RoutineLoad();
            }
        }

        public IEnumerator RoutineLoadDemand()
        {
            for (int i = 0; i < LoadersLoadOnDemand.Count; i++)
            {
                yield return LoadersLoadOnDemand[i].RoutineLoad();
            }
        }

        public IEnumerator RoutineLoadAll()
        {
            yield return RoutineLoadStart();
            yield return RoutineLoadDemand();
        }
    }
}