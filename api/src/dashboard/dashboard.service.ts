import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [
            totalIps,
            totalHashes,
            totalDomains,
            pendingIps,
            pendingHashes,
            pendingDomains,
            recentLogs,
        ] = await Promise.all([
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
        ])

        // Gráfico dos últimos 7 dias
        const last7Days = await this.getLast7DaysData()

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
        }
    }

    private async getLast7DaysData() {
        const days: { date: string; ips: number; hashes: number; domains: number }[] = []

        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)
            const nextDate = new Date(date)
            nextDate.setDate(nextDate.getDate() + 1)

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
            ])

            days.push({
                date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
                ips,
                hashes,
                domains,
            })
        }
        return days
    }
}