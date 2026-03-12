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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(range = '7d') {
        const [totalIps, totalHashes, totalDomains, pendingIps, pendingHashes, pendingDomains, recentLogs,] = await Promise.all([
            this.prisma.ip.count({ where: { status: 'approved' } }),
            this.prisma.hash.count({ where: { status: 'approved' } }),
            this.prisma.domain.count({ where: { status: 'approved' } }),
            this.prisma.ip.count({ where: { status: 'pending' } }),
            this.prisma.hash.count({ where: { status: 'pending' } }),
            this.prisma.domain.count({ where: { status: 'pending' } }),
            this.prisma.auditLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true, role: true } } },
            }),
        ]);
        const chartData = await this.getChartData(range);
        return {
            totalIps, totalHashes, totalDomains,
            pendingTotal: pendingIps + pendingHashes + pendingDomains,
            pendingIps, pendingHashes, pendingDomains,
            recentLogs,
            chartData,
            range,
        };
    }
    async getChartData(range) {
        const now = new Date();
        if (range === '12h') {
            const slots = [];
            for (let i = 11; i >= 0; i--) {
                const from = new Date(now);
                from.setHours(from.getHours() - i, 0, 0, 0);
                const to = new Date(from);
                to.setHours(to.getHours() + 1);
                const [ips, hashes, domains] = await Promise.all([
                    this.prisma.ip.count({ where: { createdAt: { gte: from, lt: to } } }),
                    this.prisma.hash.count({ where: { createdAt: { gte: from, lt: to } } }),
                    this.prisma.domain.count({ where: { createdAt: { gte: from, lt: to } } }),
                ]);
                slots.push({
                    date: from.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    ips, hashes, domains,
                });
            }
            return slots;
        }
        const days = range === '30d' ? 30 : 7;
        const slots = [];
        for (let i = days - 1; i >= 0; i--) {
            const from = new Date(now);
            from.setDate(from.getDate() - i);
            from.setHours(0, 0, 0, 0);
            const to = new Date(from);
            to.setDate(to.getDate() + 1);
            const [ips, hashes, domains] = await Promise.all([
                this.prisma.ip.count({ where: { createdAt: { gte: from, lt: to } } }),
                this.prisma.hash.count({ where: { createdAt: { gte: from, lt: to } } }),
                this.prisma.domain.count({ where: { createdAt: { gte: from, lt: to } } }),
            ]);
            slots.push({
                date: range === '30d'
                    ? from.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : from.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
                ips, hashes, domains,
            });
        }
        return slots;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map