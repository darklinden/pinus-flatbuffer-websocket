using System.Text;
using System.Threading;
using Cysharp.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

namespace Http
{
    public partial class Request
    {
        internal void AddCachePreventer(StringBuilder sb)
        {
            sb.Append("t");
            sb.Append(Time.realtimeSinceStartup);
            sb.Append("=0");
        }

        public async UniTask<TRecv> AsyncGet<TRecv>(string Url, string Data, int Timeout, string requestContentType) where TRecv : class
        {
            IsRunning = true;
            var urlSb = Utils.CachedSB;
            urlSb.Append(Url);

            if (Url.IndexOf('?') == -1)
            {
                urlSb.Append("?");
                if (!string.IsNullOrEmpty(Data))
                {
                    urlSb.Append(Data);
                    urlSb.Append("&");
                }
            }
            else
            {
                urlSb.Append("&");
                if (!string.IsNullOrEmpty(Data))
                {
                    urlSb.Append(Data);
                    urlSb.Append("&");
                }
            }

            AddCachePreventer(urlSb);

            var tmpUrl = urlSb.ToString();

            UnityWebRequest getRequest = null;
            if (typeof(TRecv) == typeof(Texture2D))
            {
                getRequest = UnityWebRequestTexture.GetTexture(tmpUrl);
            }
            else if (typeof(TRecv) == typeof(AssetBundle))
            {
                getRequest = UnityWebRequestAssetBundle.GetAssetBundle(tmpUrl);
            }
            else if (typeof(TRecv) == typeof(AudioClip))
            {
                getRequest = UnityWebRequestMultimedia.GetAudioClip(tmpUrl, AudioType.MPEG);
            }
            else
            {
                getRequest = UnityWebRequest.Get(tmpUrl);
            }

            getRequest.SetRequestHeader("Content-Type", requestContentType);
            getRequest.timeout = Timeout;
            getRequest.certificateHandler = SSL_Handler.Default;

            // Request and wait for the desired page.
            try
            {
                Error = null;
                Result = null;
                cts = new CancellationTokenSource();
                await getRequest.SendWebRequest().ToUniTask(null, PlayerLoopTiming.TimeUpdate, cts.Token);
            }
            catch (System.Exception e)
            {
                Error = e.Message;
                Log.E("Request.AsyncGet:", Url, "Data:", Data + "Failed:", e);
            }

            TRecv result = null;
            switch (getRequest.result)
            {
                case UnityWebRequest.Result.ConnectionError:
                case UnityWebRequest.Result.DataProcessingError:
                case UnityWebRequest.Result.ProtocolError:
                    Error = getRequest.error;
                    Log.E(getRequest.error);
                    break;
                case UnityWebRequest.Result.Success:
                    Log.D("Request.RoutineGet: " + tmpUrl + " Success: " + getRequest.downloadHandler.text);
                    if (typeof(TRecv) == typeof(Texture2D))
                    {
                        var texture = DownloadHandlerTexture.GetContent(getRequest);
                        result = texture as TRecv;
                    }
                    else if (typeof(TRecv) == typeof(AssetBundle))
                    {
                        var assetBundle = DownloadHandlerAssetBundle.GetContent(getRequest);
                        result = assetBundle as TRecv;
                    }
                    else if (typeof(TRecv) == typeof(Texture2D))
                    {
                        var audioClip = DownloadHandlerAudioClip.GetContent(getRequest);
                        result = audioClip as TRecv;
                    }
                    else if (typeof(TRecv) == typeof(string))
                    {
                        var text = getRequest.downloadHandler.text;
                        result = text as TRecv;
                    }
                    else
                    {
                        var data = getRequest.downloadHandler.data;
                        result = data as TRecv;
                    }
                    break;
                default:
                    break;
            }
            getRequest.Dispose();
            IsRunning = false;
            return result;
        }

        public async UniTask<TRecv> AsyncFormGet<TRecv>(string Url, object Data, int Timeout = 10) where TRecv : class
        {
            var data = Utils.StructValuesToFormStr(Data);
            return await AsyncGet<TRecv>(Url, data, Timeout, RequestContentType.FORM);
        }

        public async UniTask<TRecv> AsyncJsonGet<TRecv>(string Url, object Data, int Timeout = 10) where TRecv : class
        {
            var data = Utils.StructValuesToJSON(Data);
            return await AsyncGet<TRecv>(Url, data, Timeout, RequestContentType.JSON);
        }
    }
}