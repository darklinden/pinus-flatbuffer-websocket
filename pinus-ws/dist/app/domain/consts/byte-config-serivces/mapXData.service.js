"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapXDataService = void 0;
const fs_1 = require("fs");
const path = require("path");
const flatbuffers = require("flatbuffers");
const route_1 = require("route");
const common_1 = require("@nestjs/common");
const pinus_logger_1 = require("pinus-logger");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
let MapXDataService = class MapXDataService {
    constructor() {
        this.data = null;
        this.init();
    }
    async init() {
        let config_path = path.join(__dirname, '..', '..', '..', '..', 'config');
        ;
        const file = path.join(config_path, 'bytes', 'Map', 'MapXData.bytes');
        logger.log(`${this.constructor.name} loading config ${file} ...`);
        const buff = await fs_1.promises.readFile(file, 'binary');
        let original = Buffer.from(buff, 'binary');
        let buffer = new flatbuffers.ByteBuffer(original);
        const args = route_1.proto.MapXData.getRoot(buffer);
        const table = args.unpack();
        const dict = {};
        for (let i = 0; i < table.rows.length; i++) {
            var row = table.rows[i];
            dict[row.id] = row;
        }
        this.data = dict;
    }
    exit() {
        this.data = null;
    }
    get(id) {
        if (!this.data)
            return null;
        return this.data[id];
    }
};
MapXDataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MapXDataService);
exports.MapXDataService = MapXDataService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwWERhdGEuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9kb21haW4vY29uc3RzL2J5dGUtY29uZmlnLXNlcml2Y2VzL21hcFhEYXRhLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQW9DO0FBQ3BDLDZCQUE2QjtBQUM3QiwyQ0FBMkM7QUFDM0MsaUNBQThCO0FBQzlCLDJDQUE0QztBQUU1QywrQ0FBeUM7QUFDekMsSUFBSSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFHM0QsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUV4QjtRQUlRLFNBQUksR0FBMkMsSUFBSSxDQUFDO1FBSHhELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBSUQsS0FBSyxDQUFDLElBQUk7UUFFTixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFBQSxDQUFDO1FBRTFFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLG1CQUFtQixJQUFJLE1BQU0sQ0FBQyxDQUFDO1FBRWxFLE1BQU0sSUFBSSxHQUFHLE1BQU0sYUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDOUMsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sSUFBSSxHQUFHLGFBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUU1QixNQUFNLElBQUksR0FBMkMsRUFBRSxDQUFDO1FBRXhELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQ3RCO1FBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELElBQUk7UUFDQSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRU0sR0FBRyxDQUFDLEVBQVU7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7Q0FDSixDQUFBO0FBdkNZLGVBQWU7SUFEM0IsSUFBQSxtQkFBVSxHQUFFOztHQUNBLGVBQWUsQ0F1QzNCO0FBdkNZLDBDQUFlIn0=