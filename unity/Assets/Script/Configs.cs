using System.Collections.Generic;
using System;
using System.Diagnostics;
using Google.FlatBuffers;
using Proto;
using UnityEngine;

public class Configs
{
    private static Lazy<Configs> _lazyInstance = new Lazy<Configs>(() => new Configs());
    public static Configs Instance => _lazyInstance.Value;

    private ByteBuffer m_MapDataBytes = null;
    private MapXData m_MapData;
    private Dictionary<int, int> m_MapIdToIndex = new Dictionary<int, int>();
    public void Init()
    {
        if (m_MapDataBytes == null)
        {
            var bytes = Resources.Load<TextAsset>("Configs/Map/MapXData").bytes;
            m_MapDataBytes = new ByteBuffer(bytes);
            m_MapData = Proto.MapXData.GetRoot(m_MapDataBytes);
            for (int i = 0; i < m_MapData.RowsLength; i++)
            {
                var row = m_MapData.Rows(i);
                m_MapIdToIndex[row.Value.Id] = i;
            }
        }
    }

    public Proto.MapXDataRow? GetMapData(int mapId)
    {
        if (m_MapIdToIndex.TryGetValue(mapId, out var index))
        {
            return m_MapData.Rows(index).Value;
        }
        return null;
    }

    [Conditional("DEBUG")]
    public void LogConfigs()
    {
        Log.D("Configs", "Maps : ");
        for (int i = 0; i < m_MapData.RowsLength; i++)
        {
            var row = m_MapData.Rows(i);
            if (row.HasValue) Log.D(row.Value.Id, row.Value.Name);
        }
    }
}