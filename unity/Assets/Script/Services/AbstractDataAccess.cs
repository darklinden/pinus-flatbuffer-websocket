using Cysharp.Threading.Tasks;
using Google.FlatBuffers;

namespace Service
{
    public abstract class AbstractDataAccess
    {
        public async UniTask Nap()
        {
            await UniTask.Delay(200, true);
        }

        public virtual async UniTask AsyncReleaseData(ByteBuffer data, int frameCount)
        {
            await UniTask.DelayFrame(frameCount, PlayerLoopTiming.TimeUpdate);
            data.Dispose();
        }

        /// <summary>
        /// 延迟 3 帧后 将 flatbuffers 使用的 字节流 回池
        /// </summary>
        /// <param name="data"></param>
        public virtual void DelayReleaseData(IFlatbufferObject data)
        {
            AsyncReleaseData(data.ByteBuffer, 3).Forget();
        }
    }
}