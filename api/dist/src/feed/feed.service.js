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
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let FeedService = class FeedService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    isExpired(expiresAt) {
        if (!expiresAt)
            return false;
        return new Date() > expiresAt;
    }
    async getIpFeed() {
        const ips = await this.prisma.ip.findMany({
            where: { status: 'approved' }
        });
        const active = ips
            .filter(ip => !this.isExpired(ip.expiresAt))
            .map(ip => ip.address);
        await this.audit.log({
            action: 'FEED_GENERATED',
            entity: 'FEED',
            details: `Feed de IPs gerado com ${active.length} entradas`,
        });
        return active.join('\n');
    }
    async getHashFeed() {
        const hashes = await this.prisma.hash.findMany({
            where: { status: 'approved' }
        });
        const active = hashes
            .filter(h => !this.isExpired(h.expiresAt))
            .map(h => h.value);
        await this.audit.log({
            action: 'FEED_GENERATED',
            entity: 'FEED',
            details: `Feed de Hashes gerado com ${active.length} entradas`,
        });
        return active.join('\n');
    }
    async getDomainFeed() {
        const domains = await this.prisma.domain.findMany({
            where: { status: 'approved' }
        });
        const active = domains
            .filter(d => !this.isExpired(d.expiresAt))
            .map(d => d.domain);
        await this.audit.log({
            action: 'FEED_GENERATED',
            entity: 'FEED',
            details: `Feed de Domínios gerado com ${active.length} entradas`,
        });
        return active.join('\n');
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], FeedService);
//# sourceMappingURL=feed.service.js.map