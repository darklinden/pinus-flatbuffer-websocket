using System.Text;
using UnityEngine.Networking;
using Cysharp.Threading.Tasks;
using System.Threading;

namespace Http
{
    public partial class Request
    {
        public async UniTask<TRecv> AsyncPost<TRecv>(string Url, byte[] Data, int Timeout, string requestContentType) where TRecv : class
        {
            IsRunning = true;
            Error = null;
            Result = null;

            var postRequest = new UnityWebRequest(Url, UnityWebRequest.kHttpVerbPOST)
            {
                downloadHandler = new DownloadHandlerBuffer()
            };

            if (Data != null)
            {
                postRequest.uploadHandler = new UploadHandlerRaw(Data);
                postRequest.disposeUploadHandlerOnDispose = true;
            }

            postRequest.disposeDownloadHandlerOnDispose = true;

            postRequest.SetRequestHeader("Content-Type", requestContentType);
            postRequest.timeout = Timeout;
            postRequest.certificateHandler = SSL_Handler.Default;

            try
            {
                cts = new CancellationTokenSource();
                await postRequest.SendWebRequest().ToUniTask(null, PlayerLoopTiming.TimeUpdate, cts.Token);
            }
            catch (System.Exception e)
            {
                Error = e.Message;
                Log.E("Request.AsyncPost:", Url, "Data:", Data + "Failed:", postRequest.error);
            }

            TRecv result = null;
            if (postRequest.result == UnityWebRequest.Result.ConnectionError
                || postRequest.result == UnityWebRequest.Result.ProtocolError)
            {
                Log.E("Request.AsyncPost:", Url, "Data:", "Failed:", postRequest.error);
            }
            else if (postRequest.isDone)
            {
                Log.D("Request.AsyncPost:", Url, "Data:", "Success:", postRequest.downloadHandler.text);

                if (typeof(TRecv) == typeof(string))
                {
                    result = postRequest.downloadHandler.text as TRecv;
                }
                else
                {
                    result = postRequest.downloadHandler.data as TRecv;
                }
            }

            postRequest.Dispose();
            IsRunning = false;
            return result;
        }

        // text or bytes
        public async UniTask<TRecv> AsyncFormPost<TSend, TRecv>(string Url, TSend Data, int Timeout = 10) where TRecv : class
        {
            var postStr = Utils.StructValuesToFormStr(Data);
            var postData = Utils.Str2Utf8(postStr);
            var result = await AsyncPost<TRecv>(Url, postData, Timeout, RequestContentType.FORM);
            return result as TRecv;
        }

        public async UniTask<TRecv> AsyncJsonPost<TSend, TRecv>(string Url, TSend Data, int Timeout = 10) where TRecv : class
        {
            if (typeof(TSend) == typeof(string))
            {
                var postData = Utils.Str2Utf8(Data as string);
                var result = await AsyncPost<TRecv>(Url, postData, Timeout, RequestContentType.JSON);
                return result;
            }
            else
            {
                var poseStr = Utils.StructValuesToJSON(Data);
                var postData = Utils.Str2Utf8(poseStr);
                var result = await AsyncPost<TRecv>(Url, postData, Timeout, RequestContentType.JSON);
                return result;
            }
        }

        public async UniTask<TRecv> AsyncBinaryPost<TSend, TRecv>(string Url, byte[] Data, int Timeout = 10) where TRecv : class
        {
            var result = await AsyncPost<TRecv>(Url, Data, Timeout, RequestContentType.BINARY);
            return result;
        }
    }
}