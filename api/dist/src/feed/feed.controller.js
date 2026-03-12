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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedController = void 0;
const common_1 = require("@nestjs/common");
const feed_service_1 = require("./feed.service");
let FeedController = class FeedController {
    feedService;
    constructor(feedService) {
        this.feedService = feedService;
    }
    async ips(res) {
        const data = await this.feedService.getIps();
        res.setHeader('Content-Type', 'text/plain');
        res.send(data.join('\n'));
    }
    async hashes(res) {
        const data = await this.feedService.getHashes();
        res.setHeader('Content-Type', 'text/plain');
        res.send(data.join('\n'));
    }
    async domains(res) {
        const data = await this.feedService.getDomains();
        res.setHeader('Content-Type', 'text/plain');
        res.send(data.join('\n'));
    }
};
exports.FeedController = FeedController;
__decorate([
    (0, common_1.Get)('ips'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "ips", null);
__decorate([
    (0, common_1.Get)('hashes'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "hashes", null);
__decorate([
    (0, common_1.Get)('domains'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "domains", null);
exports.FeedController = FeedController = __decorate([
    (0, common_1.Controller)('feed'),
    __metadata("design:paramtypes", [feed_service_1.FeedService])
], FeedController);
//# sourceMappingURL=feed.controller.js.map