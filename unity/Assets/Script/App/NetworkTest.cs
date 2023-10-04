using System.Collections;
using UnityEngine;
using Google.FlatBuffers;
using Cysharp.Threading.Tasks;
using System;
using Service;
using Utils;

public class NetworkTest : MonoBehaviour
{
    private void Start()
    {
        Configs.Instance.Initialize();
    }

    public void OnButtonLoginClicked()
    {
        AsyncLogin().Forget();
    }

    private async UniTask AsyncLogin()
    {
        await Configs.Instance.AsyncLoadStart();

        var httpLogin = Singleton<HttpLogin>.Instance;
        var httpRegister = Singleton<HttpRegister>.Instance;
        var wsConnect = Singleton<WsConnect>.Instance;
        var userEnter = Singleton<UserEnter>.Instance;

        var result = await httpLogin.AsyncRequest("test", "test");
        if (result == null)
        {
            Log.W("NetworkTest AsyncLogin", "http login failed, try register");

            result = await httpRegister.AsyncRequest("test", "test");
            if (result == null)
            {
                Log.E("NetworkTest AsyncLogin", "http register failed");
                return;
            }
        }

        await wsConnect.AsyncConnect();

        var userEnterResult = await userEnter.AsyncRequest(result);

        if (userEnterResult == null)
        {
            Log.E("NetworkTest AsyncLogin", "user enter failed");
            return;
        }

        Log.D("NetworkTest AsyncLogin result", "user-name", userEnterResult.Value.User.Value.Name);
        Log.D("NetworkTest AsyncLogin result", "user-level", userEnterResult.Value.User.Value.Level);
    }
}
