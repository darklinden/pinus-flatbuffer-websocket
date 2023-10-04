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
        public ServerErrorMsg ServerErrorMsg { get; internal set; }
    }

    public class ServerErrorMsg : IConfigLoader
    {
        public int Priority => 0;
        public bool LoadOnStart => true;
        public bool DataLoaded { get; private set; } = false;

        public void Initialize(Handler configs)
        {
            configs.ServerErrorMsg = this;
        }

        private Dictionary<int, string> m_ServerErrorCodeToMsg = null;

        public async UniTask AsyncLoad()
        {
            if (!DataLoaded)
            {
                var loaded = await Addressables.LoadAssetAsync<TextAsset>("Assets/Configs/ServerErrorMsg.bytes");
                var serverErrorMsgBytes = new ByteBuffer(loaded.bytes);

                // 提取数据有消耗且常用的数据，可以直接转成要使用的对象存起来
                var serverErrorMsg = Proto.ServerErrorMsg.GetRoot(serverErrorMsgBytes);
                m_ServerErrorCodeToMsg = new Dictionary<int, string>(serverErrorMsg.RowsLength);
                for (int i = 0; i < serverErrorMsg.RowsLength; i++)
                {
                    var row = serverErrorMsg.Rows(i);
                    m_ServerErrorCodeToMsg[(int)row.Value.ErrCode] = row.Value.ErrMsg;
                }

                Addressables.Release(loaded);

                DataLoaded = true;
            }
        }

        public string GetErrMsg(int? errorType)
        {
            string msg = null;
            if (errorType == null)
            {
                m_ServerErrorCodeToMsg.TryGetValue((int)Proto.ServerErrorType.ERR_FAILED, out msg);
                return null;
            }

            if (m_ServerErrorCodeToMsg.TryGetValue(errorType.Value, out msg))
            {
                return msg;
            }

            // default error msg
            m_ServerErrorCodeToMsg.TryGetValue((int)Proto.ServerErrorType.ERR_FAILED, out msg);
            return msg;
        }

        public string GetErrMsg(Proto.ServerErrorType errorType)
        {
            return GetErrMsg((int)errorType);
        }
    }
}