const fs = require('fs');
const path = require('path');
import { proto } from 'route';
import * as flatbuffers from 'flatbuffers';

export function getMapData(): proto.IMapXDataT {
    const file = path.join(__dirname, '..', 'config', 'bytes', 'Map', 'MapXData.bytes');
    let original = Buffer.from(fs.readFileSync(file, 'binary'), 'binary');
    let buffer = new flatbuffers.ByteBuffer(original);
    const args = proto.MapXData.getRoot(buffer);
    return args.unpack();
}