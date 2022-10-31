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
        // configs 
        Configs.Instance.Init();
        Configs.Instance.LogConfigs();

        Pinus.EventBus.OnHandshakeOver += OnHandshakeOver;
        EventDispatcher.AddListener<ByteBuffer>(Structs.FooBar.OnFoo.route, OnFoo, this);
        EventDispatcher.AddListener<ByteBuffer>(Structs.FooBar.OnBar.route, OnBar, this);

        Pinus.Connect("ws://127.0.0.1:3010");
    }

    private void OnBar(ByteBuffer e)
    {
        var foo = Foo.GetRoot(e);
        Log.D("OnBar Return", foo.Foo_);
        e.Release();
    }

    private void OnFoo(ByteBuffer e)
    {
        var bar = Bar.GetRoot(e);
        Log.D("OnFoo Return", bar.Bar_);
        e.Release();
    }

    private bool m_TestStarted = false;
    private void OnHandshakeOver(string url)
    {
        Log.D("NetworkTest.OnHandshakeOver");

        m_TestStarted = true;
    }

    private void Update()
    {
        if (m_TestStarted)
        {
            var builder = FlatBufferBuilder.InstanceDefault;
            Foo.StartFoo(builder);
            Foo.AddFoo(builder, 1121212121212121212L);
            var foo = Foo.End(builder);
            builder.Finish(foo.Value);

            Pinus.Request(Structs.FooBar.OnFoo.route, builder.DataBuffer);
            builder.Clear();
        }
    }
}
