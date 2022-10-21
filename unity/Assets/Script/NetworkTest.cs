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
        var configs = Resources.LoadAll("Configs");
        foreach (var config in configs)
        {
            var textAsset = config as TextAsset;
            if (textAsset != null)
            {
                if (textAsset.name == "MapXData")
                {
                    var bb = new ByteBuffer(textAsset.bytes);
                    var map = MapXData.GetRoot(bb);
                    for (int i = 0; i < map.RowsLength; i++)
                    {
                        var row = map.Rows(i);
                        if (row.HasValue)
                        {
                            Log.D(row.Value.Id, row.Value.Name, row.Value);

                            Log.D("Camp1");
                            for (int j = 0; j < row.Value.Camp1Length; j++)
                            {
                                var v = row.Value.Camp1(j);
                                if (v.HasValue)
                                {
                                    Log.D(v.Value.X, v.Value.Y, v.Value.Z);
                                }
                            }

                            Log.D("Camp2");
                            for (int j = 0; j < row.Value.Camp2Length; j++)
                            {
                                var v = row.Value.Camp2(j);
                                if (v.HasValue)
                                {
                                    Log.D(v.Value.X, v.Value.Y, v.Value.Z);
                                }
                            }
                        }
                    }
                }
            }
        }


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
