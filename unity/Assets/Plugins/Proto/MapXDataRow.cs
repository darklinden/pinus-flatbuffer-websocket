// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Proto
{

using global::System;
using global::System.Collections.Generic;
using global::Google.FlatBuffers;

public struct MapXDataRow : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_24_3_25(); }
  public static MapXDataRow GetRoot(ByteBuffer _bb) { return GetRoot(_bb, new MapXDataRow()); }
  public static MapXDataRow GetRoot(ByteBuffer _bb, MapXDataRow obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public MapXDataRow __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public int Id { get { int o = __p.__offset(4); return o != 0 ? __p.bb.GetInt(o + __p.bb_pos) : (int)0; } }
  public string Name { get { int o = __p.__offset(6); return o != 0 ? __p.__string(o + __p.bb_pos) : null; } }
#if ENABLE_SPAN_T
  public Span<byte> GetNameBytes() { return __p.__vector_as_span<byte>(6, 1); }
#else
  public ArraySegment<byte>? GetNameBytes() { return __p.__vector_as_arraysegment(6); }
#endif
  public byte[] GetNameArray() { return __p.__vector_as_array<byte>(6); }
  public Proto.Vec3? Camp1(int j) { int o = __p.__offset(8); return o != 0 ? (Proto.Vec3?)(new Proto.Vec3()).__assign(__p.__indirect(__p.__vector(o) + j * 4), __p.bb) : null; }
  public int Camp1Length { get { int o = __p.__offset(8); return o != 0 ? __p.__vector_len(o) : 0; } }
  public Proto.Vec3? Camp2(int j) { int o = __p.__offset(10); return o != 0 ? (Proto.Vec3?)(new Proto.Vec3()).__assign(__p.__indirect(__p.__vector(o) + j * 4), __p.bb) : null; }
  public int Camp2Length { get { int o = __p.__offset(10); return o != 0 ? __p.__vector_len(o) : 0; } }

  public static Offset<Proto.MapXDataRow> Create(FlatBufferBuilder builder,
      int id = 0,
      StringOffset nameOffset = default(StringOffset),
      VectorOffset camp1Offset = default(VectorOffset),
      VectorOffset camp2Offset = default(VectorOffset)) {
    builder.StartTable(4);
    MapXDataRow.AddCamp2(builder, camp2Offset);
    MapXDataRow.AddCamp1(builder, camp1Offset);
    MapXDataRow.AddName(builder, nameOffset);
    MapXDataRow.AddId(builder, id);
    return MapXDataRow.End(builder);
  }

  public static void StartMapXDataRow(FlatBufferBuilder builder) { builder.StartTable(4); }
  public static void AddId(FlatBufferBuilder builder, int id) { builder.AddInt(0, id, 0); }
  public static void AddName(FlatBufferBuilder builder, StringOffset nameOffset) { builder.AddOffset(1, nameOffset.Value, 0); }
  public static void AddCamp1(FlatBufferBuilder builder, VectorOffset camp1Offset) { builder.AddOffset(2, camp1Offset.Value, 0); }
  public static VectorOffset CreateCamp1Vector(FlatBufferBuilder builder, Offset<Proto.Vec3>[] data) { builder.StartVector(4, data.Length, 4); for (int i = data.Length - 1; i >= 0; i--) builder.AddOffset(data[i].Value); return builder.EndVector(); }
  public static VectorOffset CreateCamp1VectorBlock(FlatBufferBuilder builder, Offset<Proto.Vec3>[] data) { builder.StartVector(4, data.Length, 4); builder.Add(data); return builder.EndVector(); }
  public static VectorOffset CreateCamp1VectorBlock(FlatBufferBuilder builder, ArraySegment<Offset<Proto.Vec3>> data) { builder.StartVector(4, data.Count, 4); builder.Add(data); return builder.EndVector(); }
  public static VectorOffset CreateCamp1VectorBlock(FlatBufferBuilder builder, IntPtr dataPtr, int sizeInBytes) { builder.StartVector(1, sizeInBytes, 1); builder.Add<Offset<Proto.Vec3>>(dataPtr, sizeInBytes); return builder.EndVector(); }
  public static void StartCamp1Vector(FlatBufferBuilder builder, int numElems) { builder.StartVector(4, numElems, 4); }
  public static void AddCamp2(FlatBufferBuilder builder, VectorOffset camp2Offset) { builder.AddOffset(3, camp2Offset.Value, 0); }
  public static VectorOffset CreateCamp2Vector(FlatBufferBuilder builder, Offset<Proto.Vec3>[] data) { builder.StartVector(4, data.Length, 4); for (int i = data.Length - 1; i >= 0; i--) builder.AddOffset(data[i].Value); return builder.EndVector(); }
  public static VectorOffset CreateCamp2VectorBlock(FlatBufferBuilder builder, Offset<Proto.Vec3>[] data) { builder.StartVector(4, data.Length, 4); builder.Add(data); return builder.EndVector(); }
  public static VectorOffset CreateCamp2VectorBlock(FlatBufferBuilder builder, ArraySegment<Offset<Proto.Vec3>> data) { builder.StartVector(4, data.Count, 4); builder.Add(data); return builder.EndVector(); }
  public static VectorOffset CreateCamp2VectorBlock(FlatBufferBuilder builder, IntPtr dataPtr, int sizeInBytes) { builder.StartVector(1, sizeInBytes, 1); builder.Add<Offset<Proto.Vec3>>(dataPtr, sizeInBytes); return builder.EndVector(); }
  public static void StartCamp2Vector(FlatBufferBuilder builder, int numElems) { builder.StartVector(4, numElems, 4); }
  public static Offset<Proto.MapXDataRow> End(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Proto.MapXDataRow>(o);
  }
  public MapXDataRowT UnPack() {
    var _o = new MapXDataRowT();
    this.UnPackTo(_o);
    return _o;
  }
  public void UnPackTo(MapXDataRowT _o) {
    _o.Id = this.Id;
    _o.Name = this.Name;
    _o.Camp1 = new List<Proto.Vec3T>();
    for (var _j = 0; _j < this.Camp1Length; ++_j) {_o.Camp1.Add(this.Camp1(_j).HasValue ? this.Camp1(_j).Value.UnPack() : null);}
    _o.Camp2 = new List<Proto.Vec3T>();
    for (var _j = 0; _j < this.Camp2Length; ++_j) {_o.Camp2.Add(this.Camp2(_j).HasValue ? this.Camp2(_j).Value.UnPack() : null);}
  }
  public static Offset<Proto.MapXDataRow> Pack(FlatBufferBuilder builder, MapXDataRowT _o) {
    if (_o == null) return default(Offset<Proto.MapXDataRow>);
    var _name = _o.Name == null ? default(StringOffset) : builder.CreateString(_o.Name);
    var _camp1 = default(VectorOffset);
    if (_o.Camp1 != null) {
      var __camp1 = new Offset<Proto.Vec3>[_o.Camp1.Count];
      for (var _j = 0; _j < __camp1.Length; ++_j) { __camp1[_j] = Proto.Vec3.Pack(builder, _o.Camp1[_j]); }
      _camp1 = CreateCamp1Vector(builder, __camp1);
    }
    var _camp2 = default(VectorOffset);
    if (_o.Camp2 != null) {
      var __camp2 = new Offset<Proto.Vec3>[_o.Camp2.Count];
      for (var _j = 0; _j < __camp2.Length; ++_j) { __camp2[_j] = Proto.Vec3.Pack(builder, _o.Camp2[_j]); }
      _camp2 = CreateCamp2Vector(builder, __camp2);
    }
    return Create(
      builder,
      _o.Id,
      _name,
      _camp1,
      _camp2);
  }
}

public class MapXDataRowT
{
  public int Id { get; set; }
  public string Name { get; set; }
  public List<Proto.Vec3T> Camp1 { get; set; }
  public List<Proto.Vec3T> Camp2 { get; set; }

  public MapXDataRowT() {
    this.Id = 0;
    this.Name = null;
    this.Camp1 = null;
    this.Camp2 = null;
  }
}


static public class MapXDataRowVerify
{
  static public bool Verify(Google.FlatBuffers.Verifier verifier, uint tablePos)
  {
    return verifier.VerifyTableStart(tablePos)
      && verifier.VerifyField(tablePos, 4 /*Id*/, 4 /*int*/, 4, false)
      && verifier.VerifyString(tablePos, 6 /*Name*/, false)
      && verifier.VerifyVectorOfTables(tablePos, 8 /*Camp1*/, Proto.Vec3Verify.Verify, false)
      && verifier.VerifyVectorOfTables(tablePos, 10 /*Camp2*/, Proto.Vec3Verify.Verify, false)
      && verifier.VerifyTableEnd(tablePos);
  }
}

}
