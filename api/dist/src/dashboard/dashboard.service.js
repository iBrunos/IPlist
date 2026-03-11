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
    async getStats() {
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
        const last7Days = await this.getLast7DaysData();
        return {
            totalIps,
            totalHashes,
            totalDomains,
            pendingTotal: pendingIps + pendingHashes + pendingDomains,
            pendingIps,
            pendingHashes,
            pendingDomains,
            recentLogs,
            last7Days,
        };
    }
    async getLast7DaysData() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const [ips, hashes, domains] = await Promise.all([
                this.prisma.ip.count({
                    where: { createdAt: { gte: date, lt: nextDate } }
                }),
                this.prisma.hash.count({
                    where: { createdAt: { gte: date, lt: nextDate } }
                }),
                this.prisma.domain.count({
                    where: { createdAt: { gte: date, lt: nextDate } }
                }),
            ]);
            days.push({
                date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
                ips,
                hashes,
                domains,
            });
        }
        return days;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map