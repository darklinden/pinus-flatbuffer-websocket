const fs = require('fs');
const path = require('path');
import * as flatbuffers from 'flatbuffers';
import { proto } from 'route';

export class ConfigsDataCache {
    private static _instance: ConfigsDataCache;
    private _cache: { [key: string]: any } = {};

    private constructor() {
    }

    public static getInstance() {
        if (!ConfigsDataCache._instance) {
            ConfigsDataCache._instance = new ConfigsDataCache();
        }
        return ConfigsDataCache._instance;
    }

    public get(key: string) {
        return this._cache[key];
    }

    public set(key: string, value: any) {
        this._cache[key] = value;
    }

    public getMapDataTable(): { [key: number]: proto.IMapXDataRowT } {
        let data: { [key: number]: proto.IMapXDataRowT } = this.get('MapData');
        if (!data) {
            const file = path.join(__dirname, '..', 'config', 'bytes', 'Map', 'MapXData.bytes');
            let original = Buffer.from(fs.readFileSync(file, 'binary'), 'binary');
            let buffer = new flatbuffers.ByteBuffer(original);
            const args = proto.MapXData.getRoot(buffer);
            const table = args.unpack();
            data = {};
            for (let i = 0; i < table.rows.length; i++) {
                const row = table.rows[i];
                data[row.id] = row;
            }
            this.set('MapData', data);
        }
        return data as { [key: number]: proto.IMapXDataRowT };
    }

    public getMapData(id: number): proto.IMapXDataRowT {
        let data = this.getMapDataTable();
        return data[id];
    }
}

export const configs = ConfigsDataCache.getInstance();