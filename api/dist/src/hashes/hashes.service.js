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
exports.HashesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const roles_enum_1 = require("../auth/roles.enum");
let HashesService = class HashesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(data, requester) {
        const status = requester.role === roles_enum_1.Role.TECNICO ? 'pending' : 'approved';
        const hash = await this.prisma.hash.create({
            data: {
                value: data.value,
                type: data.type,
                description: data.description,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                status,
                createdById: requester.id,
                approvedById: status === 'approved' ? requester.id : null,
            }
        });
        await this.audit.log({
            action: 'CREATE',
            entity: 'HASH',
            entityId: hash.id,
            details: `Hash ${hash.value} (${hash.type}) criada com status ${status}`,
            userId: requester.id,
        });
        return hash;
    }
    async findAll(requester, { page = 1, limit = 10, search = '' } = {}) {
        const skip = (page - 1) * limit;
        const searchFilter = search ? {
            OR: [
                { value: { contains: search, mode: 'insensitive' } },
                { type: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        } : {};
        let roleFilter = {};
        if (requester.role === roles_enum_1.Role.TECNICO) {
            roleFilter = { createdById: requester.id };
        }
        else if (requester.role === roles_enum_1.Role.LIDER_TECNICO) {
            roleFilter = { createdBy: { equipe: requester.equipe } };
        }
        const finalWhere = Object.keys(roleFilter).length > 0 && search
            ? { AND: [roleFilter, { OR: searchFilter.OR }] }
            : { ...roleFilter, ...searchFilter };
        const [data, total] = await Promise.all([
            this.prisma.hash.findMany({
                where: finalWhere,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { createdBy: { select: { username: true, equipe: true } } },
            }),
            this.prisma.hash.count({ where: finalWhere }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async approve(id, requester) {
        if (requester.role === roles_enum_1.Role.TECNICO) {
            throw new common_1.ForbiddenException('Sem permissão para aprovar');
        }
        const hash = await this.prisma.hash.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!hash)
            throw new common_1.NotFoundException('Hash não encontrada');
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && hash.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode aprovar hashes da sua equipe');
        }
        const updated = await this.prisma.hash.update({
            where: { id },
            data: { status: 'approved', approvedById: requester.id }
        });
        await this.audit.log({
            action: 'APPROVE',
            entity: 'HASH',
            entityId: hash.id,
            details: `Hash ${hash.value} aprovada`,
            userId: requester.id,
        });
        return updated;
    }
    async update(id, data, requester) {
        const hash = await this.prisma.hash.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!hash)
            throw new common_1.NotFoundException('Hash não encontrada');
        if (requester.role === roles_enum_1.Role.TECNICO && hash.createdById !== requester.id) {
            throw new common_1.ForbiddenException('Só pode editar suas próprias hashes');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && hash.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode editar hashes da sua equipe');
        }
        const updated = await this.prisma.hash.update({
            where: { id },
            data: {
                description: data.description,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            }
        });
        await this.audit.log({
            action: 'UPDATE',
            entity: 'HASH',
            entityId: hash.id,
            details: `Hash ${hash.value} editada`,
            userId: requester.id,
        });
        return updated;
    }
    async remove(id, requester) {
        const hash = await this.prisma.hash.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!hash)
            throw new common_1.NotFoundException('Hash não encontrada');
        if (requester.role === roles_enum_1.Role.TECNICO && hash.createdById !== requester.id) {
            throw new common_1.ForbiddenException('Só pode apagar suas próprias hashes');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && hash.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode apagar hashes da sua equipe');
        }
        await this.audit.log({
            action: 'DELETE',
            entity: 'HASH',
            entityId: hash.id,
            details: `Hash ${hash.value} apagada`,
            userId: requester.id,
        });
        return this.prisma.hash.delete({ where: { id } });
    }
};
exports.HashesService = HashesService;
exports.HashesService = HashesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], HashesService);
//# sourceMappingURL=hashes.service.js.map