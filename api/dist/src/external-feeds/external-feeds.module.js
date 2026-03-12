"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalFeedsModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const external_feeds_service_1 = require("./external-feeds.service");
const external_feeds_controller_1 = require("./external-feeds.controller");
const prisma_service_1 = require("../database/prisma.service");
let ExternalFeedsModule = class ExternalFeedsModule {
};
exports.ExternalFeedsModule = ExternalFeedsModule;
exports.ExternalFeedsModule = ExternalFeedsModule = __decorate([
    (0, common_1.Module)({
        imports: [platform_express_1.MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } })],
        controllers: [external_feeds_controller_1.ExternalFeedsController],
        providers: [external_feeds_service_1.ExternalFeedsService, prisma_service_1.PrismaService],
    })
], ExternalFeedsModule);
//# sourceMappingURL=external-feeds.module.js.map