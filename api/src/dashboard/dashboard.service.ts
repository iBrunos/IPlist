import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(range = '7d') {
    const [
      totalIps, totalHashes, totalDomains,
      pendingIps, pendingHashes, pendingDomains,
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

    const chartData = await this.getChartData(range)

    return {
      totalIps, totalHashes, totalDomains,
      pendingTotal: pendingIps + pendingHashes + pendingDomains,
      pendingIps, pendingHashes, pendingDomains,
      recentLogs,
      chartData,
      range,
    }
  }

  private async getChartData(range: string) {
    const now = new Date()

    if (range === '12h') {
      const slots: { date: string; ips: number; hashes: number; domains: number }[] = []
      for (let i = 11; i >= 0; i--) {
        const from = new Date(now)
        from.setHours(from.getHours() - i, 0, 0, 0)
        const to = new Date(from)
        to.setHours(to.getHours() + 1)

        const [ips, hashes, domains] = await Promise.all([
          this.prisma.ip.count({ where: { createdAt: { gte: from, lt: to } } }),
          this.prisma.hash.count({ where: { createdAt: { gte: from, lt: to } } }),
          this.prisma.domain.count({ where: { createdAt: { gte: from, lt: to } } }),
        ])

        slots.push({
          date: from.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          ips, hashes, domains,
        })
      }
      return slots
    }

    const days = range === '30d' ? 30 : 7
    const slots: { date: string; ips: number; hashes: number; domains: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const from = new Date(now)
      from.setDate(from.getDate() - i)
      from.setHours(0, 0, 0, 0)
      const to = new Date(from)
      to.setDate(to.getDate() + 1)

      const [ips, hashes, domains] = await Promise.all([
        this.prisma.ip.count({ where: { createdAt: { gte: from, lt: to } } }),
        this.prisma.hash.count({ where: { createdAt: { gte: from, lt: to } } }),
        this.prisma.domain.count({ where: { createdAt: { gte: from, lt: to } } }),
      ])

      slots.push({
        date: range === '30d'
          ? from.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          : from.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        ips, hashes, domains,
      })
    }
    return slots
  }
}