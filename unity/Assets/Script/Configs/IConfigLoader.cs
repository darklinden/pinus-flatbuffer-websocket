using System.Collections;

namespace FlatConfigs
{
    public interface IConfigLoader
    {
        bool LoadOnStart { get; }
        bool DataLoaded { get; }

        void Initialize(Handler configs);

        IEnumerator RoutineLoad();
    }
}