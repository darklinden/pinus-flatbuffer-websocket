"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstsVersionService = void 0;
const fs_1 = require("fs");
const path = require("path");
const common_1 = require("@nestjs/common");
const pinus_logger_1 = require("pinus-logger");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
let ConstsVersionService = class ConstsVersionService {
    constructor() {
        this.data = null;
    }
    async init() {
        await this.get_data();
    }
    exit() {
        this.data = null;
    }
    async get_data() {
        if (this.data) {
            return this.data;
        }
        let config_path = path.join(__dirname, '..', '..', '..', 'config');
        const file = path.join(config_path, 'bytes', 'version.bytes');
        logger.log(`${this.constructor.name} loading config ${file} ...`);
        const text = await fs_1.promises.readFile(file, 'utf8');
        this.data = text.trim();
        return this.data;
    }
};
ConstsVersionService = __decorate([
    (0, common_1.Injectable)()
], ConstsVersionService);
exports.ConstsVersionService = ConstsVersionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzVmVyc2lvbi5zZXJ2aWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9kb21haW4vY29uc3RzL2NvbnN0c1ZlcnNpb24uc2VydmljZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkJBQW9DO0FBQ3BDLDZCQUE2QjtBQUM3QiwyQ0FBNEM7QUFFNUMsK0NBQXlDO0FBQ3pDLElBQUksTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBRzNELElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBQWpDO1FBVVksU0FBSSxHQUFXLElBQUksQ0FBQztJQWtCaEMsQ0FBQztJQTFCRyxLQUFLLENBQUMsSUFBSTtRQUNOLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUlELEtBQUssQ0FBQyxRQUFRO1FBRVYsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQ3BCO1FBRUQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFbkUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzlELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksbUJBQW1CLElBQUksTUFBTSxDQUFDLENBQUM7UUFFbEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxhQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV4QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztDQUNKLENBQUE7QUE1Qlksb0JBQW9CO0lBRGhDLElBQUEsbUJBQVUsR0FBRTtHQUNBLG9CQUFvQixDQTRCaEM7QUE1Qlksb0RBQW9CIn0=