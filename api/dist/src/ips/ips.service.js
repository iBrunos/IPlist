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
exports.IpsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const roles_enum_1 = require("../auth/roles.enum");
let IpsService = class IpsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(data, requester) {
        const status = requester.role === roles_enum_1.Role.TECNICO ? 'pending' : 'approved';
        const ip = await this.prisma.ip.create({
            data: {
                address: data.address,
                description: data.description,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                status,
                createdById: requester.id,
                approvedById: status === 'approved' ? requester.id : null,
            }
        });
        await this.audit.log({
            action: 'CREATE',
            entity: 'IP',
            entityId: ip.id,
            details: `IP ${ip.address} criado com status ${status}`,
            userId: requester.id,
        });
        return ip;
    }
    async findAll(requester) {
        if (requester.role === roles_enum_1.Role.TECNICO) {
            return this.prisma.ip.findMany({
                where: { createdById: requester.id }
            });
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO) {
            return this.prisma.ip.findMany({
                where: { createdBy: { equipe: requester.equipe } },
                include: { createdBy: { select: { username: true, equipe: true } } }
            });
        }
        return this.prisma.ip.findMany({
            include: { createdBy: { select: { username: true, equipe: true } } }
        });
    }
    async approve(id, requester) {
        if (requester.role === roles_enum_1.Role.TECNICO) {
            throw new common_1.ForbiddenException('Sem permissão para aprovar');
        }
        const ip = await this.prisma.ip.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!ip)
            throw new common_1.NotFoundException('IP não encontrado');
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && ip.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode aprovar IPs da sua equipe');
        }
        const updated = await this.prisma.ip.update({
            where: { id },
            data: { status: 'approved', approvedById: requester.id }
        });
        await this.audit.log({
            action: 'APPROVE',
            entity: 'IP',
            entityId: ip.id,
            details: `IP ${ip.address} aprovado`,
            userId: requester.id,
        });
        return updated;
    }
    async update(id, data, requester) {
        const ip = await this.prisma.ip.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!ip)
            throw new common_1.NotFoundException('IP não encontrado');
        if (requester.role === roles_enum_1.Role.TECNICO && ip.createdById !== requester.id) {
            throw new common_1.ForbiddenException('Só pode editar seus próprios IPs');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && ip.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode editar IPs da sua equipe');
        }
        const updated = await this.prisma.ip.update({
            where: { id },
            data: {
                description: data.description,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            }
        });
        await this.audit.log({
            action: 'UPDATE',
            entity: 'IP',
            entityId: ip.id,
            details: `IP ${ip.address} editado`,
            userId: requester.id,
        });
        return updated;
    }
    async remove(id, requester) {
        const ip = await this.prisma.ip.findUnique({
            where: { id },
            include: { createdBy: true }
        });
        if (!ip)
            throw new common_1.NotFoundException('IP não encontrado');
        if (requester.role === roles_enum_1.Role.TECNICO && ip.createdById !== requester.id) {
            throw new common_1.ForbiddenException('Só pode apagar seus próprios IPs');
        }
        if (requester.role === roles_enum_1.Role.LIDER_TECNICO && ip.createdBy.equipe !== requester.equipe) {
            throw new common_1.ForbiddenException('Só pode apagar IPs da sua equipe');
        }
        await this.audit.log({
            action: 'DELETE',
            entity: 'IP',
            entityId: ip.id,
            details: `IP ${ip.address} apagado`,
            userId: requester.id,
        });
        return this.prisma.ip.delete({ where: { id } });
    }
};
exports.IpsService = IpsService;
exports.IpsService = IpsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], IpsService);
//# sourceMappingURL=ips.service.js.map