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
exports.ExternalFeedsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const external_feeds_service_1 = require("./external-feeds.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_enum_1 = require("../auth/roles.enum");
let ExternalFeedsController = class ExternalFeedsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    create(body, req) {
        return this.service.create(body, req.user);
    }
    async preview(file, content) {
        const text = file ? file.buffer.toString('utf-8') : content;
        return this.service.previewContent(text);
    }
    async importFile(file, content, name, req) {
        const text = file ? file.buffer.toString('utf-8') : content;
        return this.service.importContent(text, name, req.user);
    }
    update(id, body) {
        return this.service.update(id, body);
    }
    remove(id) {
        return this.service.remove(id);
    }
    sync(id) {
        return this.service.syncFeed(id);
    }
};
exports.ExternalFeedsController = ExternalFeedsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUPER_ADMIN, roles_enum_1.Role.LIDER_TECNICO),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExternalFeedsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUPER_ADMIN, roles_enum_1.Role.LIDER_TECNICO),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ExternalFeedsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('preview'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUPER_ADMIN, roles_enum_1.Role.LIDER_TECNICO),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExternalFeedsController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUPER_ADMIN, roles_enum_1.Role.LIDER_TECNICO),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Body)('name')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ExternalFeedsController.prototype, "importFile", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUPER_ADMIN, roles_enum_1.Role.LIDER_TECNICO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExternalFeedsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUPER_ADMIN, roles_enum_1.Role.LIDER_TECNICO),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExternalFeedsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUPER_ADMIN, roles_enum_1.Role.LIDER_TECNICO),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExternalFeedsController.prototype, "sync", null);
exports.ExternalFeedsController = ExternalFeedsController = __decorate([
    (0, common_1.Controller)('external-feeds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [external_feeds_service_1.ExternalFeedsService])
], ExternalFeedsController);
//# sourceMappingURL=external-feeds.controller.js.map