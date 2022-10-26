"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.ConfigsDataCache = void 0;
const fs = require('fs');
const path = require('path');
const flatbuffers = require("flatbuffers");
const route_1 = require("route");
class ConfigsDataCache {
    constructor() {
        this._cache = {};
    }
    static getInstance() {
        if (!ConfigsDataCache._instance) {
            ConfigsDataCache._instance = new ConfigsDataCache();
        }
        return ConfigsDataCache._instance;
    }
    get(key) {
        return this._cache[key];
    }
    set(key, value) {
        this._cache[key] = value;
    }
    getMapDataTable() {
        let data = this.get('MapData');
        if (!data) {
            const file = path.join(__dirname, '..', 'config', 'bytes', 'Map', 'MapXData.bytes');
            let original = Buffer.from(fs.readFileSync(file, 'binary'), 'binary');
            let buffer = new flatbuffers.ByteBuffer(original);
            const args = route_1.proto.MapXData.getRoot(buffer);
            const table = args.unpack();
            data = {};
            for (let i = 0; i < table.rows.length; i++) {
                const row = table.rows[i];
                data[row.id] = row;
            }
            this.set('MapData', data);
        }
        return data;
    }
    getMapData(id) {
        let data = this.getMapDataTable();
        return data[id];
    }
}
exports.ConfigsDataCache = ConfigsDataCache;
exports.configs = ConfigsDataCache.getInstance();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9jb25maWdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsMkNBQTJDO0FBQzNDLGlDQUE4QjtBQUU5QixNQUFhLGdCQUFnQjtJQUl6QjtRQUZRLFdBQU0sR0FBMkIsRUFBRSxDQUFDO0lBRzVDLENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVztRQUNyQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFO1lBQzdCLGdCQUFnQixDQUFDLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7U0FDdkQ7UUFDRCxPQUFPLGdCQUFnQixDQUFDLFNBQVMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sR0FBRyxDQUFDLEdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFTSxHQUFHLENBQUMsR0FBVyxFQUFFLEtBQVU7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVNLGVBQWU7UUFDbEIsSUFBSSxJQUFJLEdBQTJDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3BGLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdEUsSUFBSSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sSUFBSSxHQUFHLGFBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM1QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ1YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN4QyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQzthQUN0QjtZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsT0FBTyxJQUE4QyxDQUFDO0lBQzFELENBQUM7SUFFTSxVQUFVLENBQUMsRUFBVTtRQUN4QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbEMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBNUNELDRDQTRDQztBQUVZLFFBQUEsT0FBTyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDIn0=