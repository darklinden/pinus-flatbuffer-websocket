using Cysharp.Threading.Tasks;

namespace FlatConfigs
{
    public interface IConfigLoader
    {
        int Priority { get; }
        bool LoadOnStart { get; }
        bool DataLoaded { get; }

        void Initialize(Handler configs);

        UniTask AsyncLoad();
    }
}