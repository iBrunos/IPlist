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
exports.DomainsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const roles_enum_1 = require("../auth/roles.enum");
let DomainsService = class DomainsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(data, requester) {
        const status = requester.role === roles_enum_1.Role.TECNICO ? 'pending' : 'approved';
        const domain = await this.prisma.domain.create({
            data: {
                domain: data.domain,
                description: data.description,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                status,
                createdById: requester.id,
                approvedById: status === 'approved' ? requester.id : null,
            }
        });
        await this.audit.log({
            action: 'CREATE',
            entity: 'DOMAIN',
            entityId: domain.id,
            details: `Domínio ${domain.domain} criado com status ${status}`,
            userId: requester.id,
        });
        return domain;
    }
    async findAll(requester) {
        if (requester.role === roles_enum_1.Role.TECNICO) {
            return this.prisma.domain.findMany({
                where: { createdById: requester.id }
            });
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO) {
            return this.prisma.domain.findMany({
                where: { createdBy: { equipe: requester.equipe } },
                include: { createdBy: { select: { username: true, equipe: true } } }
            });
        }
        return this.prisma.domain.findMany({
            include: { createdBy: { select: { username: true, equipe: true } } }
        });
    }
    async approve(id, requester) {
        if (requester.role === roles_enum_1.Role.TECNICO) {
            throw new common_1.ForbiddenException('Sem permissão para aprovar');
        }
        const domain = await this.prisma.domain.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!domain)
            throw new common_1.NotFoundException('Domínio não encontrado');
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && domain.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode aprovar domínios da sua equipe');
        }
        const updated = await this.prisma.domain.update({
            where: { id },
            data: { status: 'approved', approvedById: requester.id }
        });
        await this.audit.log({
            action: 'APPROVE',
            entity: 'DOMAIN',
            entityId: domain.id,
            details: `Domínio ${domain.domain} aprovado`,
            userId: requester.id,
        });
        return updated;
    }
    async update(id, data, requester) {
        const domain = await this.prisma.domain.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!domain)
            throw new common_1.NotFoundException('Domínio não encontrado');
        if (requester.role === roles_enum_1.Role.TECNICO && domain.createdById !== requester.id) {
            throw new common_1.ForbiddenException('Só pode editar seus próprios domínios');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && domain.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode editar domínios da sua equipe');
        }
        const updated = await this.prisma.domain.update({
            where: { id },
            data: {
                description: data.description,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            }
        });
        await this.audit.log({
            action: 'UPDATE',
            entity: 'DOMAIN',
            entityId: domain.id,
            details: `Domínio ${domain.domain} editado`,
            userId: requester.id,
        });
        return updated;
    }
    async remove(id, requester) {
        const domain = await this.prisma.domain.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!domain)
            throw new common_1.NotFoundException('Domínio não encontrado');
        if (requester.role === roles_enum_1.Role.TECNICO && domain.createdById !== requester.id) {
            throw new common_1.ForbiddenException('Só pode apagar seus próprios domínios');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && domain.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode apagar domínios da sua equipe');
        }
        await this.audit.log({
            action: 'DELETE',
            entity: 'DOMAIN',
            entityId: domain.id,
            details: `Domínio ${domain.domain} apagado`,
            userId: requester.id,
        });
        return this.prisma.domain.delete({ where: { id } });
    }
};
exports.DomainsService = DomainsService;
exports.DomainsService = DomainsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], DomainsService);
//# sourceMappingURL=domains.service.js.map