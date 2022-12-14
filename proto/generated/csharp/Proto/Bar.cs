// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Proto
{

using global::System;
using global::System.Collections.Generic;
using global::Google.FlatBuffers;

public struct Bar : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_22_9_29(); }
  public static Bar GetRoot(ByteBuffer _bb) { return GetRoot(_bb, new Bar()); }
  public static Bar GetRoot(ByteBuffer _bb, Bar obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public Bar __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public long Bar_ { get { int o = __p.__offset(4); return o != 0 ? __p.bb.GetLong(o + __p.bb_pos) : (long)0; } }

  public static Offset<Proto.Bar> Create(FlatBufferBuilder builder,
      long bar = 0) {
    builder.StartTable(1);
    Bar.AddBar(builder, bar);
    return Bar.End(builder);
  }

  public static void StartBar(FlatBufferBuilder builder) { builder.StartTable(1); }
  public static void AddBar(FlatBufferBuilder builder, long bar) { builder.AddLong(0, bar, 0); }
  public static Offset<Proto.Bar> End(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Proto.Bar>(o);
  }
  public BarT UnPack() {
    var _o = new BarT();
    this.UnPackTo(_o);
    return _o;
  }
  public void UnPackTo(BarT _o) {
    _o.Bar_ = this.Bar_;
  }
  public static Offset<Proto.Bar> Pack(FlatBufferBuilder builder, BarT _o) {
    if (_o == null) return default(Offset<Proto.Bar>);
    return Create(
      builder,
      _o.Bar_);
  }
}

public class BarT
{
  public long Bar_ { get; set; }

  public BarT() {
    this.Bar_ = 0;
  }
}


}
