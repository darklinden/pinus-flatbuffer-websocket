using System.Collections;
using System.Collections.Generic;
using Cysharp.Threading.Tasks;
using Google.FlatBuffers;
using UnityEngine;
using UnityEngine.AddressableAssets;

namespace FlatConfigs
{
    public partial class Handler
    {
        public MapXData MapXData { get; internal set; }
    }

    public class MapXData : IConfigLoader
    {
        public bool LoadOnStart => false;
        public bool DataLoaded { get; private set; } = false;

        public int Priority => 1;

        public void Initialize(Handler configs)
        {
            configs.MapXData = this;
        }

        private ByteBuffer m_MapXDataBytes = null;
        private Proto.MapXData m_MapXData;
        private Dictionary<int, int> m_MapXDataIdToIndex = new Dictionary<int, int>();

        public async UniTask AsyncLoad()
        {
            if (!DataLoaded)
            {
                var ta = await Addressables.LoadAssetAsync<TextAsset>("Assets/Configs/Map/MapXData.bytes");

                // 不是需要转对象的数据，可以利用flatbuffer的优势，直接用bytebuffer
                m_MapXDataBytes = new ByteBuffer(ta.bytes);
                m_MapXData = Proto.MapXData.GetRoot(m_MapXDataBytes);
                for (int i = 0; i < m_MapXData.RowsLength; i++)
                {
                    var row = m_MapXData.Rows(i);
                    m_MapXDataIdToIndex[row.Value.Id] = i;
                }
                DataLoaded = true;
            }
        }

        public Proto.MapXDataRow? GetData(int characterId)
        {
            if (m_MapXDataIdToIndex.TryGetValue(characterId, out var index))
            {
                return m_MapXData.Rows(index);
            }
            return null;
        }
    }
}