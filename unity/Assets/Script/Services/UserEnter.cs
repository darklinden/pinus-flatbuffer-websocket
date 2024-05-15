using System;
using Cysharp.Threading.Tasks;
using Google.FlatBuffers;
using Proto;

namespace Service
{
    public class UserEnter : AbstractDataAccess
    {
        public async UniTask<ResponseUserEnter?> AsyncRequest(string token)
        {

#if SERVICE_LOG
            Log.D("UserEnter AsyncRequest");
#endif

            var builder = FlatBufferBuilder.InstanceDefault;
            var tokenOffset = builder.CreateString(token);
            var offset = RequestUserEnter.Create(builder, tokenOffset);
            builder.Finish(offset.Value);

            var bb = await Pinus.AsyncRequest(Structs.GameRoute.EntryEntry.route, builder);

            var data = ResponseUserEnter.GetRoot(bb);

#if SERVICE_LOG
            // 为了打印，这里将字节流转进行了拆包，实际使用时不需要这样
            Log.D("UserEnter.OnUserEnter Success", data.UnPack());
#endif

            DelayReleaseData(data);

            return data;
        }
    }
}