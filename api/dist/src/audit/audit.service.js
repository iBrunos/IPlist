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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const roles_enum_1 = require("../auth/roles.enum");
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(params) {
        return this.prisma.auditLog.create({
            data: {
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: params.details,
                userId: params.userId,
            }
        });
    }
    async findAll(requester, { page = 1, limit = 20, search = '' } = {}) {
        const skip = (page - 1) * limit;
        const searchFilter = search ? {
            OR: [
                { action: { contains: search, mode: 'insensitive' } },
                { entity: { contains: search, mode: 'insensitive' } },
                { details: { contains: search, mode: 'insensitive' } },
                { user: { username: { contains: search, mode: 'insensitive' } } },
            ]
        } : {};
        const roleFilter = requester.role === roles_enum_1.Role.LIDER_TECNICO
            ? { user: { equipe: requester.equipe } }
            : {};
        const finalWhere = Object.keys(roleFilter).length > 0 && search
            ? { AND: [roleFilter, { OR: searchFilter.OR }] }
            : { ...roleFilter, ...searchFilter };
        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: finalWhere,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { username: true, equipe: true, role: true } }
                },
            }),
            this.prisma.auditLog.count({ where: finalWhere }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map