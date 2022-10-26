using System;
using PinusUnity;
using UnityEngine;
using Google.FlatBuffers;
using Proto;

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
        throw new NotImplementedException();
    }

    private void OnFoo(ByteBuffer e)
    {
        throw new NotImplementedException();
    }

    private void OnHandshakeOver(string url)
    {
        var builder = FlatBufferBuilder.InstanceDefault;
        Foo.StartFoo(builder);
        Foo.AddFoo(builder, 1121212121212121212L);
        var foo = Foo.End(builder);
        builder.Finish(foo.Value);

        Pinus.Request(Structs.FooBar.OnFoo.route, builder.DataBuffer, (ByteBuffer data) =>
        {
            var bar = Bar.GetRoot(data);
            Log.D("OnFoo Return", bar.Bar_);
        });
    }
}
