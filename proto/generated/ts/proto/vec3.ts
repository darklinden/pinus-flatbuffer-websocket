// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class Vec3 implements flatbuffers.IUnpackableObject<Vec3T> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Vec3 {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRoot(bb:flatbuffers.ByteBuffer, obj?:Vec3):Vec3 {
  return (obj || new Vec3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRoot(bb:flatbuffers.ByteBuffer, obj?:Vec3):Vec3 {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Vec3()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

x():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

y():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

z():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

static startVec3(builder:flatbuffers.Builder) {
  builder.startObject(3);
}

static addX(builder:flatbuffers.Builder, x:number) {
  builder.addFieldInt32(0, x, 0);
}

static addY(builder:flatbuffers.Builder, y:number) {
  builder.addFieldInt32(1, y, 0);
}

static addZ(builder:flatbuffers.Builder, z:number) {
  builder.addFieldInt32(2, z, 0);
}

static end(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static create(builder:flatbuffers.Builder, x:number, y:number, z:number):flatbuffers.Offset {
  Vec3.startVec3(builder);
  Vec3.addX(builder, x);
  Vec3.addY(builder, y);
  Vec3.addZ(builder, z);
  return Vec3.end(builder);
}

unpack(): Vec3T {
  return new Vec3T(
    this.x(),
    this.y(),
    this.z()
  );
}


unpackTo(_o: Vec3T): void {
  _o.x = this.x();
  _o.y = this.y();
  _o.z = this.z();
}
}

export class Vec3T implements flatbuffers.IGeneratedObject {
constructor(
  public x: number = 0,
  public y: number = 0,
  public z: number = 0
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return Vec3.create(builder,
    this.x,
    this.y,
    this.z
  );
}
}
