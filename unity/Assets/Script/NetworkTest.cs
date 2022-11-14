using System;
using PinusUnity;
using UnityEngine;
using Google.FlatBuffers;
using Proto;
using XPool;

public class NetworkTest : MonoBehaviour
{
    private void OnEnable()
    {
        // test array pool
        var arrayPool = ArrayPool<byte>.Shared;
        var list = XList<byte[]>.Get(20);

        for (int i = 0; i < 10; i++)
        {
            list[i] = arrayPool.Rent(1024);
        }
        for (int i = 0; i < 10; i++)
        {
            arrayPool.Return(list[i]);
        }

        for (int i = 0; i < 20; i++)
        {
            list[i] = arrayPool.Rent(1024);
        }
        for (int i = 0; i < 20; i++)
        {
            arrayPool.Return(list[i]);
        }

        for (int i = 0; i < 30; i++)
        {
            list[i] = arrayPool.Rent(1024);
        }
        for (int i = 0; i < 30; i++)
        {
            arrayPool.Return(list[i]);
        }

        for (int i = 0; i < 40; i++)
        {
            list[i] = arrayPool.Rent(1024);
        }
        for (int i = 0; i < 40; i++)
        {
            arrayPool.Return(list[i]);
        }

        for (int i = 0; i < 80; i++)
        {
            list[i] = arrayPool.Rent(1024);
        }
        for (int i = 0; i < 80; i++)
        {
            arrayPool.Return(list[i]);
        }

        // configs 
        Configs.Instance.Init();
        Configs.Instance.LogConfigs();

        Pinus.EventBus.OnHandshakeOver += OnHandshakeOver;
        EventDispatcher.AddListener<ByteBuffer>(Structs.FooBar.PushBar.route, OnPushBar, this);
        EventDispatcher.AddListener<ByteBuffer>(Structs.FooBar.CallFoo.route, OnCallFooResp, this);

        Pinus.Connect("ws://127.0.0.1:3010");
    }

    private void OnPushBar(ByteBuffer e)
    {
        var bar = Bar.GetRoot(e);
        Log.D("OnPushBar", bar.Bar_);
        e.Dispose();
    }

    private void OnCallFooResp(ByteBuffer e)
    {
        var bar = Bar.GetRoot(e);
        Log.D("OnCallFooResp", bar.Bar_);
        e.Dispose();
    }

    private bool m_TestStarted = false;
    private void OnHandshakeOver(string url)
    {
        Log.D("NetworkTest.OnHandshakeOver");

        m_TestStarted = true;
    }

    private float m_TimePassed = 0;
    private void Update()
    {
        if (m_TestStarted)
        {
            m_TimePassed += Time.deltaTime;
            if (m_TimePassed > 0.2f)
            {
                m_TimePassed = 0;

                var builder = FlatBufferBuilder.InstanceDefault;
                Foo.StartFoo(builder);
                Foo.AddFoo(builder, 1121212121212121212L);
                var foo = Foo.End(builder);
                builder.Finish(foo.Value);

                Pinus.Request(Structs.FooBar.CallFoo.route, builder.DataBuffer);
                builder.Clear();
            }
        }
    }
}
