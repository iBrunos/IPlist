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

  async findAll(requester: any) {
    if (requester.role === Role.LIDER_TECNICO) {
      return this.prisma.auditLog.findMany({
        where: {
          user: { equipe: requester.equipe }
        },
        include: {
          user: { select: { username: true, equipe: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return this.prisma.auditLog.findMany({
      include: {
        user: { select: { username: true, equipe: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}