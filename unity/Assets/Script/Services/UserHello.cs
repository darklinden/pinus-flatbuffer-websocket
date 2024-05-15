using Google.FlatBuffers;
using Proto;
using Cysharp.Threading.Tasks;

namespace Service
{
    public class UserHello : AbstractDataAccess
    {
        public async UniTask<ResponseUserHello?> AsyncRequest()
        {

#if SERVICE_LOG
            Log.D("UserHello Request");
#endif

            var bb = await Pinus.AsyncRequest(Structs.GameRoute.EntryHello.route);

            var data = ResponseUserHello.GetRoot(bb);

#if SERVICE_LOG
            Log.D("UserHello OnData:", data.UnPack());
#endif

            DelayReleaseData(data);
            return data;
        }
    }
}