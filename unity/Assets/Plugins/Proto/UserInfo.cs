// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Proto
{

using global::System;
using global::System.Collections.Generic;
using global::Google.FlatBuffers;

public struct UserInfo : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_23_5_26(); }
  public static UserInfo GetRoot(ByteBuffer _bb) { return GetRoot(_bb, new UserInfo()); }
  public static UserInfo GetRoot(ByteBuffer _bb, UserInfo obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public UserInfo __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public string Name { get { int o = __p.__offset(4); return o != 0 ? __p.__string(o + __p.bb_pos) : null; } }
#if ENABLE_SPAN_T
  public Span<byte> GetNameBytes() { return __p.__vector_as_span<byte>(4, 1); }
#else
  public ArraySegment<byte>? GetNameBytes() { return __p.__vector_as_arraysegment(4); }
#endif
  public byte[] GetNameArray() { return __p.__vector_as_array<byte>(4); }
  public int Level { get { int o = __p.__offset(6); return o != 0 ? __p.bb.GetInt(o + __p.bb_pos) : (int)0; } }

  public static Offset<Proto.UserInfo> Create(FlatBufferBuilder builder,
      StringOffset nameOffset = default(StringOffset),
      int level = 0) {
    builder.StartTable(2);
    UserInfo.AddLevel(builder, level);
    UserInfo.AddName(builder, nameOffset);
    return UserInfo.End(builder);
  }

  public static void StartUserInfo(FlatBufferBuilder builder) { builder.StartTable(2); }
  public static void AddName(FlatBufferBuilder builder, StringOffset nameOffset) { builder.AddOffset(0, nameOffset.Value, 0); }
  public static void AddLevel(FlatBufferBuilder builder, int level) { builder.AddInt(1, level, 0); }
  public static Offset<Proto.UserInfo> End(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Proto.UserInfo>(o);
  }
  public UserInfoT UnPack() {
    var _o = new UserInfoT();
    this.UnPackTo(_o);
    return _o;
  }
  public void UnPackTo(UserInfoT _o) {
    _o.Name = this.Name;
    _o.Level = this.Level;
  }
  public static Offset<Proto.UserInfo> Pack(FlatBufferBuilder builder, UserInfoT _o) {
    if (_o == null) return default(Offset<Proto.UserInfo>);
    var _name = _o.Name == null ? default(StringOffset) : builder.CreateString(_o.Name);
    return Create(
      builder,
      _name,
      _o.Level);
  }
}

public class UserInfoT
{
  public string Name { get; set; }
  public int Level { get; set; }

  public UserInfoT() {
    this.Name = null;
    this.Level = 0;
  }
}


static public class UserInfoVerify
{
  static public bool Verify(Google.FlatBuffers.Verifier verifier, uint tablePos)
  {
    return verifier.VerifyTableStart(tablePos)
      && verifier.VerifyString(tablePos, 4 /*Name*/, false)
      && verifier.VerifyField(tablePos, 6 /*Level*/, 4 /*int*/, 4, false)
      && verifier.VerifyTableEnd(tablePos);
  }
}

}
