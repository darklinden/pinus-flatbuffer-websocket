"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMapData = void 0;
const fs = require('fs');
const path = require('path');
const route_1 = require("route");
const flatbuffers = require("flatbuffers");
function getMapData() {
    const file = path.join(__dirname, '..', 'config', 'bytes', 'Map', 'MapXData.bytes');
    let original = Buffer.from(fs.readFileSync(file, 'binary'), 'binary');
    let buffer = new flatbuffers.ByteBuffer(original);
    const args = route_1.proto.MapXData.getRoot(buffer);
    return args.unpack();
}
exports.getMapData = getMapData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9jb25maWdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsaUNBQThCO0FBQzlCLDJDQUEyQztBQUUzQyxTQUFnQixVQUFVO0lBQ3RCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BGLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEUsSUFBSSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sSUFBSSxHQUFHLGFBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFORCxnQ0FNQyJ9