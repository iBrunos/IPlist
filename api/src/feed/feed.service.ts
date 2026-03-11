import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class FeedService {

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private isExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return false
    return new Date() > expiresAt
  }

  async getIpFeed(): Promise<string> {
    const ips = await this.prisma.ip.findMany({
      where: { status: 'approved' }
    })

    const active = ips
      .filter(ip => !this.isExpired(ip.expiresAt))
      .map(ip => ip.address)

    await this.audit.log({
      action: 'FEED_GENERATED',
      entity: 'FEED',
      details: `Feed de IPs gerado com ${active.length} entradas`,
    })

    return active.join('\n')
  }

  async getHashFeed(): Promise<string> {
    const hashes = await this.prisma.hash.findMany({
      where: { status: 'approved' }
    })

    const active = hashes
      .filter(h => !this.isExpired(h.expiresAt))
      .map(h => h.value)

    await this.audit.log({
      action: 'FEED_GENERATED',
      entity: 'FEED',
      details: `Feed de Hashes gerado com ${active.length} entradas`,
    })

    return active.join('\n')
  }

  async getDomainFeed(): Promise<string> {
    const domains = await this.prisma.domain.findMany({
      where: { status: 'approved' }
    })

    const active = domains
      .filter(d => !this.isExpired(d.expiresAt))
      .map(d => d.domain)

    await this.audit.log({
      action: 'FEED_GENERATED',
      entity: 'FEED',
      details: `Feed de Domínios gerado com ${active.length} entradas`,
    })

    return active.join('\n')
  }
}