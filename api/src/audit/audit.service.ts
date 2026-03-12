import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { Role } from '../auth/roles.enum'

@Injectable()
export class AuditService {

  constructor(private prisma: PrismaService) {}

  async log(params: {
    action: string
    entity: string
    entityId?: string
    details?: string
    userId?: string
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        userId: params.userId,
      }
    })
  }

  async findAll(requester: any, { page = 1, limit = 20, search = '' } = {}) {
    const skip = (page - 1) * limit

    const searchFilter = search ? {
      OR: [
        { action: { contains: search, mode: 'insensitive' as const } },
        { entity: { contains: search, mode: 'insensitive' as const } },
        { details: { contains: search, mode: 'insensitive' as const } },
        { user: { username: { contains: search, mode: 'insensitive' as const } } },
      ]
    } : {}

    const roleFilter = requester.role === Role.LIDER_TECNICO
      ? { user: { equipe: requester.equipe } }
      : {}

    const finalWhere = Object.keys(roleFilter).length > 0 && search
      ? { AND: [roleFilter, { OR: searchFilter.OR }] }
      : { ...roleFilter, ...searchFilter }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: finalWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, equipe: true, role: true } }
        },
      }),
      this.prisma.auditLog.count({ where: finalWhere }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}