// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Proto
{

using global::System;
using global::System.Collections.Generic;
using global::Google.FlatBuffers;

public struct UserExp : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_24_3_25(); }
  public static UserExp GetRoot(ByteBuffer _bb) { return GetRoot(_bb, new UserExp()); }
  public static UserExp GetRoot(ByteBuffer _bb, UserExp obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public static bool VerifyUserExp(ByteBuffer _bb) {Google.FlatBuffers.Verifier verifier = new Google.FlatBuffers.Verifier(_bb); return verifier.VerifyBuffer("", false, UserExpVerify.Verify); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public UserExp __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public Proto.UserExpRow? Rows(int j) { int o = __p.__offset(4); return o != 0 ? (Proto.UserExpRow?)(new Proto.UserExpRow()).__assign(__p.__indirect(__p.__vector(o) + j * 4), __p.bb) : null; }
  public int RowsLength { get { int o = __p.__offset(4); return o != 0 ? __p.__vector_len(o) : 0; } }

  public static Offset<Proto.UserExp> Create(FlatBufferBuilder builder,
      VectorOffset rowsOffset = default(VectorOffset)) {
    builder.StartTable(1);
    UserExp.AddRows(builder, rowsOffset);
    return UserExp.End(builder);
  }

  public static void StartUserExp(FlatBufferBuilder builder) { builder.StartTable(1); }
  public static void AddRows(FlatBufferBuilder builder, VectorOffset rowsOffset) { builder.AddOffset(0, rowsOffset.Value, 0); }
  public static VectorOffset CreateRowsVector(FlatBufferBuilder builder, Offset<Proto.UserExpRow>[] data) { builder.StartVector(4, data.Length, 4); for (int i = data.Length - 1; i >= 0; i--) builder.AddOffset(data[i].Value); return builder.EndVector(); }
  public static VectorOffset CreateRowsVectorBlock(FlatBufferBuilder builder, Offset<Proto.UserExpRow>[] data) { builder.StartVector(4, data.Length, 4); builder.Add(data); return builder.EndVector(); }
  public static VectorOffset CreateRowsVectorBlock(FlatBufferBuilder builder, ArraySegment<Offset<Proto.UserExpRow>> data) { builder.StartVector(4, data.Count, 4); builder.Add(data); return builder.EndVector(); }
  public static VectorOffset CreateRowsVectorBlock(FlatBufferBuilder builder, IntPtr dataPtr, int sizeInBytes) { builder.StartVector(1, sizeInBytes, 1); builder.Add<Offset<Proto.UserExpRow>>(dataPtr, sizeInBytes); return builder.EndVector(); }
  public static void StartRowsVector(FlatBufferBuilder builder, int numElems) { builder.StartVector(4, numElems, 4); }
  public static Offset<Proto.UserExp> End(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Proto.UserExp>(o);
  }
  public static void Finish(FlatBufferBuilder builder, Offset<Proto.UserExp> offset) { builder.Finish(offset.Value); }
  public static void FinishSizePrefixedUserExpBuffer(FlatBufferBuilder builder, Offset<Proto.UserExp> offset) { builder.FinishSizePrefixed(offset.Value); }
  public UserExpT UnPack() {
    var _o = new UserExpT();
    this.UnPackTo(_o);
    return _o;
  }
  public void UnPackTo(UserExpT _o) {
    _o.Rows = new List<Proto.UserExpRowT>();
    for (var _j = 0; _j < this.RowsLength; ++_j) {_o.Rows.Add(this.Rows(_j).HasValue ? this.Rows(_j).Value.UnPack() : null);}
  }
  public static Offset<Proto.UserExp> Pack(FlatBufferBuilder builder, UserExpT _o) {
    if (_o == null) return default(Offset<Proto.UserExp>);
    var _rows = default(VectorOffset);
    if (_o.Rows != null) {
      var __rows = new Offset<Proto.UserExpRow>[_o.Rows.Count];
      for (var _j = 0; _j < __rows.Length; ++_j) { __rows[_j] = Proto.UserExpRow.Pack(builder, _o.Rows[_j]); }
      _rows = CreateRowsVector(builder, __rows);
    }
    return Create(
      builder,
      _rows);
  }
}

public class UserExpT
{
  public List<Proto.UserExpRowT> Rows { get; set; }

  public UserExpT() {
    this.Rows = null;
  }
  public static UserExpT DeserializeFromBinary(byte[] fbBuffer) {
    return UserExp.GetRoot(new ByteBuffer(fbBuffer)).UnPack();
  }
  public byte[] SerializeToBinary() {
    var fbb = new FlatBufferBuilder(0x10000);
    UserExp.Finish(fbb, UserExp.Pack(fbb, this));
    return fbb.DataBuffer.ToSizedArray();
  }
}


static public class UserExpVerify
{
  static public bool Verify(Google.FlatBuffers.Verifier verifier, uint tablePos)
  {
    return verifier.VerifyTableStart(tablePos)
      && verifier.VerifyVectorOfTables(tablePos, 4 /*Rows*/, Proto.UserExpRowVerify.Verify, false)
      && verifier.VerifyTableEnd(tablePos);
  }
}

}
