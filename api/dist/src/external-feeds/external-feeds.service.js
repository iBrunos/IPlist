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
var ExternalFeedsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalFeedsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../database/prisma.service");
const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const HASH_LENGTHS = new Set([32, 40, 64, 128]);
const HEX_REGEX = /^[a-f0-9]+$/i;
function classifyLine(line) {
    const clean = line.trim();
    if (!clean || clean.startsWith('#'))
        return null;
    if (IP_REGEX.test(clean))
        return 'ip';
    if (HASH_LENGTHS.has(clean.length) && HEX_REGEX.test(clean))
        return 'hash';
    if (DOMAIN_REGEX.test(clean))
        return 'domain';
    return null;
}
function getHashType(len) {
    if (len === 32)
        return 'MD5';
    if (len === 40)
        return 'SHA1';
    if (len === 64)
        return 'SHA256';
    if (len === 128)
        return 'SHA512';
    return 'SHA256';
}
let ExternalFeedsService = ExternalFeedsService_1 = class ExternalFeedsService {
    prisma;
    logger = new common_1.Logger(ExternalFeedsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.externalFeed.findMany({
            orderBy: { createdAt: 'desc' },
            include: { createdBy: { select: { username: true } } }
        });
    }
    create(data, requester) {
        return this.prisma.externalFeed.create({
            data: {
                name: data.name,
                url: data.url,
                type: data.type ?? 'mixed',
                interval: data.interval ?? 60,
                active: data.active ?? true,
                createdById: requester.id,
            }
        });
    }
    update(id, data) {
        return this.prisma.externalFeed.update({
            where: { id },
            data: {
                name: data.name,
                url: data.url,
                type: data.type,
                interval: data.interval,
                active: data.active,
            }
        });
    }
    remove(id) {
        return this.prisma.externalFeed.delete({ where: { id } });
    }
    previewContent(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        const counts = { ip: 0, hash: 0, domain: 0, unknown: 0, total: lines.length };
        const samples = { ip: [], hash: [], domain: [] };
        for (const line of lines) {
            const type = classifyLine(line);
            if (type) {
                counts[type]++;
                if (samples[type].length < 3)
                    samples[type].push(line);
            }
            else {
                counts.unknown++;
            }
        }
        return { counts, samples };
    }
    async importContent(text, name, requester) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        const results = { ip: 0, hash: 0, domain: 0, skipped: 0 };
        for (const line of lines) {
            const type = classifyLine(line);
            try {
                if (type === 'ip') {
                    await this.prisma.ip.upsert({
                        where: { address: line },
                        update: { status: 'approved' },
                        create: {
                            address: line,
                            description: `Importado de ${name}`,
                            status: 'approved',
                            createdById: requester.id,
                            approvedById: requester.id,
                        }
                    });
                    results.ip++;
                }
                else if (type === 'hash') {
                    await this.prisma.hash.upsert({
                        where: { value: line },
                        update: { status: 'approved' },
                        create: {
                            value: line,
                            type: getHashType(line.length),
                            description: `Importado de ${name}`,
                            status: 'approved',
                            createdById: requester.id,
                            approvedById: requester.id,
                        }
                    });
                    results.hash++;
                }
                else if (type === 'domain') {
                    await this.prisma.domain.upsert({
                        where: { domain: line },
                        update: { status: 'approved' },
                        create: {
                            domain: line,
                            description: `Importado de ${name}`,
                            status: 'approved',
                            createdById: requester.id,
                            approvedById: requester.id,
                        }
                    });
                    results.domain++;
                }
                else {
                    results.skipped++;
                }
            }
            catch (_) {
                results.skipped++;
            }
        }
        return { imported: results, total: lines.length };
    }
    async syncFeed(id) {
        const feed = await this.prisma.externalFeed.findUnique({ where: { id } });
        if (!feed)
            throw new Error('Feed não encontrado');
        return this._processFeed(feed);
    }
    async syncAllActive() {
        this.logger.log('Iniciando sync automático de feeds externos...');
        const feeds = await this.prisma.externalFeed.findMany({ where: { active: true } });
        for (const feed of feeds) {
            const minutesSinceLastSync = feed.lastSyncAt
                ? (Date.now() - feed.lastSyncAt.getTime()) / 60000
                : Infinity;
            if (minutesSinceLastSync >= feed.interval) {
                await this._processFeed(feed).catch(err => this.logger.error(`Erro ao sincronizar feed ${feed.name}: ${err.message}`));
            }
        }
    }
    async _processFeed(feed) {
        const response = await fetch(feed.url);
        if (!response.ok)
            throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        let count = 0;
        for (const line of lines) {
            const type = feed.type === 'mixed' ? classifyLine(line) : feed.type;
            try {
                if (type === 'ip') {
                    await this.prisma.ip.upsert({
                        where: { address: line },
                        update: { status: 'approved' },
                        create: {
                            address: line,
                            description: `Importado de ${feed.name}`,
                            status: 'approved',
                            createdById: feed.createdById,
                            approvedById: feed.createdById,
                        }
                    });
                    count++;
                }
                else if (type === 'hash') {
                    await this.prisma.hash.upsert({
                        where: { value: line },
                        update: { status: 'approved' },
                        create: {
                            value: line,
                            type: getHashType(line.length),
                            description: `Importado de ${feed.name}`,
                            status: 'approved',
                            createdById: feed.createdById,
                            approvedById: feed.createdById,
                        }
                    });
                    count++;
                }
                else if (type === 'domain') {
                    await this.prisma.domain.upsert({
                        where: { domain: line },
                        update: { status: 'approved' },
                        create: {
                            domain: line,
                            description: `Importado de ${feed.name}`,
                            status: 'approved',
                            createdById: feed.createdById,
                            approvedById: feed.createdById,
                        }
                    });
                    count++;
                }
            }
            catch (_) { }
        }
        await this.prisma.externalFeed.update({
            where: { id: feed.id },
            data: { lastSyncAt: new Date(), lastCount: count }
        });
        this.logger.log(`Feed ${feed.name} sincronizado: ${count} itens`);
        return { synced: count, feedName: feed.name };
    }
};
exports.ExternalFeedsService = ExternalFeedsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExternalFeedsService.prototype, "syncAllActive", null);
exports.ExternalFeedsService = ExternalFeedsService = ExternalFeedsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExternalFeedsService);
//# sourceMappingURL=external-feeds.service.js.map