"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RadiusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadiusService = void 0;
const common_1 = require("@nestjs/common");
const node_radius_client_1 = __importDefault(require("node-radius-client"));
let RadiusService = RadiusService_1 = class RadiusService {
    logger = new common_1.Logger(RadiusService_1.name);
    secret = process.env.RADIUS_SECRET || 'bip';
    client = new node_radius_client_1.default({
        host: process.env.RADIUS_HOST || '10.201.131.11',
        hostPort: parseInt(process.env.RADIUS_PORT || '1812'),
    });
    async authenticate(username, password) {
        try {
            const response = await this.client.accessRequest({
                secret: this.secret,
                attributes: [
                    ['User-Name', username],
                    ['User-Password', password],
                ],
            });
            return response.code === 'Access-Accept';
        }
        catch (err) {
            this.logger.error(`Erro RADIUS: ${err.message}`);
            return false;
        }
    }
};
exports.RadiusService = RadiusService;
exports.RadiusService = RadiusService = RadiusService_1 = __decorate([
    (0, common_1.Injectable)()
], RadiusService);
//# sourceMappingURL=radius.service.js.map