using System.Collections;
using System.Collections.Generic;
using Google.FlatBuffers;
using UnityEngine;

namespace FlatConfigs
{
    public partial class Handler
    {
        public MapXData MapXData { get; internal set; }
    }

    public class MapXData : IConfigLoader
    {
        public bool LoadOnStart => true;
        public bool DataLoaded { get; private set; } = false;

        public void Initialize(Handler configs)
        {
            configs.MapXData = this;
        }

        private ByteBuffer m_MapXDataBytes = null;
        private Proto.MapXData m_MapXData;
        private Dictionary<int, int> m_MapXDataIdToIndex = new Dictionary<int, int>();

        public IEnumerator RoutineLoad()
        {
            if (!DataLoaded)
            {
                var bytes = Resources.Load<TextAsset>("Configs/Map/MapXData").bytes;
                m_MapXDataBytes = new ByteBuffer(bytes);

                m_MapXData = Proto.MapXData.GetRoot(m_MapXDataBytes);
                for (int i = 0; i < m_MapXData.RowsLength; i++)
                {
                    var row = m_MapXData.Rows(i);
                    m_MapXDataIdToIndex[row.Value.Id] = i;
                }
                yield return null;
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