using Http;
using Cysharp.Threading.Tasks;
using Proto;

namespace Service
{
    public class HttpRegister : AbstractDataAccess
    {
        private Request m_Request = null;
        // 请求账号密码登录并返回错误信息
        public async UniTask<string> AsyncRequest(string account, string password)
        {
#if SERVICE_LOG
            Log.D("HttpRegister AsyncLogin", account, password);
#endif

            if (m_Request != null && m_Request.IsRunning)
            {
#if SERVICE_LOG
                Log.W("HttpRegister AsyncLogin", "request is in progress, clear");
#endif
                m_Request.Clear();

                await Nap();
            }

            var requestData = "{\"account\":\"" + account + "\",\"password\":\"" + password + "\"}";

            if (m_Request == null) m_Request = Request.Create();

            var result = await m_Request.AsyncJsonPost<string, string>(App.Constants.HTTP_REGISTER, requestData);

            if (!string.IsNullOrEmpty(m_Request.Error) && string.IsNullOrEmpty(result))
            {
                Log.E("HttpRegister AsyncLogin", m_Request.Error);
                return null;
            }

            LitJson.JsonData json = null;
            try
            {
                json = LitJson.JsonMapper.ToObject(result);
            }
            catch (System.Exception)
            {
                json = null;
            }

            if (json == null)
            {
                Log.E("HttpRegister AsyncLogin", "result json parse error");
                return null;
            }

            var errCode = json.ContainsKey("code") ? (int)json["code"] : -1;

            if (errCode != (int)ServerErrorType.ERR_SUCCESS)
            {
                Log.E("HttpRegister AsyncLogin", "result err", errCode, Configs.Instance.ServerErrorMsg.GetErrMsg(errCode));
                return null;
            }

            var token = json.ContainsKey("data") ? json["data"].ContainsKey("token") ? (string)json["data"]["token"] : null : null;

            return token;
        }
    }
}