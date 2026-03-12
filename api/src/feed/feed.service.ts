import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getIps(): Promise<string[]> {
    const ips = await this.prisma.ip.findMany({
      where: { status: 'approved' },
      select: { address: true }
    })
    return ips.map(i => i.address)
  }

  async getHashes(): Promise<string[]> {
    const hashes = await this.prisma.hash.findMany({
      where: { status: 'approved' },
      select: { value: true }
    })
    return hashes.map(h => h.value)
  }

  async getDomains(): Promise<string[]> {
    const domains = await this.prisma.domain.findMany({
      where: { status: 'approved' },
      select: { domain: true }
    })
    return domains.map(d => d.domain)
  }
}