// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class UserInfo implements flatbuffers.IUnpackableObject<UserInfoT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):UserInfo {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRoot(bb:flatbuffers.ByteBuffer, obj?:UserInfo):UserInfo {
  return (obj || new UserInfo()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRoot(bb:flatbuffers.ByteBuffer, obj?:UserInfo):UserInfo {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new UserInfo()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

name():string|null
name(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
name(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

level():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

static startUserInfo(builder:flatbuffers.Builder) {
  builder.startObject(2);
}

static addName(builder:flatbuffers.Builder, nameOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, nameOffset, 0);
}

static addLevel(builder:flatbuffers.Builder, level:number) {
  builder.addFieldInt32(1, level, 0);
}

static end(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static create(builder:flatbuffers.Builder, nameOffset:flatbuffers.Offset, level:number):flatbuffers.Offset {
  UserInfo.startUserInfo(builder);
  UserInfo.addName(builder, nameOffset);
  UserInfo.addLevel(builder, level);
  return UserInfo.end(builder);
}

unpack?(): UserInfoT {
  return new UserInfoT(
    this.name(),
    this.level()
  );
}


unpackTo(_o: UserInfoT): void {
  _o.name = this.name();
  _o.level = this.level();
}
}

export class UserInfoT implements flatbuffers.IGeneratedObject {
constructor(
  public name: string|Uint8Array|null = null,
  public level: number = 0
){}


pack?(builder:flatbuffers.Builder): flatbuffers.Offset {
  const name = (this.name !== null ? builder.createString(this.name!) : 0);

  return UserInfo.create(builder,
    name,
    this.level
  );
}
}
