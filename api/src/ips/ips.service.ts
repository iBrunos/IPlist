import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { AuditService } from '../audit/audit.service'
import { Role } from '../auth/roles.enum'

@Injectable()
export class IpsService {

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(data: any, requester: any) {
    const status = requester.role === Role.TECNICO ? 'pending' : 'approved'

    const ip = await this.prisma.ip.create({
      data: {
        address: data.address,
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status,
        createdById: requester.id,
        approvedById: status === 'approved' ? requester.id : null,
      }
    })

    await this.audit.log({
      action: 'CREATE',
      entity: 'IP',
      entityId: ip.id,
      details: `IP ${ip.address} criado com status ${status}`,
      userId: requester.id,
    })

    return ip
  }

 async findAll(requester: any, { page = 1, limit = 10, search = '' } = {}) {
  const skip = (page - 1) * limit

  const searchFilter = search ? {
    OR: [
      { address: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } },
    ]
  } : {}

  let roleFilter: any = {}
  if (requester.role === Role.TECNICO) {
    roleFilter = { createdById: requester.id }
  } else if (requester.role === Role.LIDER_TECNICO) {
    roleFilter = { createdBy: { equipe: requester.equipe } }
  }

  const finalWhere = Object.keys(roleFilter).length > 0 && search
    ? { AND: [roleFilter, { OR: searchFilter.OR }] }
    : { ...roleFilter, ...searchFilter }

  const [data, total] = await Promise.all([
    this.prisma.ip.findMany({
      where: finalWhere,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { username: true, equipe: true } } },
    }),
    this.prisma.ip.count({ where: finalWhere }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

  async approve(id: string, requester: any) {
    if (requester.role === Role.TECNICO) {
      throw new ForbiddenException('Sem permissão para aprovar')
    }

    const ip = await this.prisma.ip.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!ip) throw new NotFoundException('IP não encontrado')

    if (requester.role === Role.LIDER_TECNICO && ip.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode aprovar IPs da sua equipe')
    }

    const updated = await this.prisma.ip.update({
      where: { id },
      data: { status: 'approved', approvedById: requester.id }
    })

    await this.audit.log({
      action: 'APPROVE',
      entity: 'IP',
      entityId: ip.id,
      details: `IP ${ip.address} aprovado`,
      userId: requester.id,
    })

    return updated
  }

  async update(id: string, data: any, requester: any) {
    const ip = await this.prisma.ip.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!ip) throw new NotFoundException('IP não encontrado')

    if (requester.role === Role.TECNICO && ip.createdById !== requester.id) {
      throw new ForbiddenException('Só pode editar seus próprios IPs')
    }

    if (requester.role === Role.LIDER_TECNICO && ip.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode editar IPs da sua equipe')
    }

    const updated = await this.prisma.ip.update({
      where: { id },
      data: {
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }
    })

    await this.audit.log({
      action: 'UPDATE',
      entity: 'IP',
      entityId: ip.id,
      details: `IP ${ip.address} editado`,
      userId: requester.id,
    })

    return updated
  }

  async remove(id: string, requester: any) {
    const ip = await this.prisma.ip.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!ip) throw new NotFoundException('IP não encontrado')

    if (requester.role === Role.TECNICO && ip.createdById !== requester.id) {
      throw new ForbiddenException('Só pode apagar seus próprios IPs')
    }

    if (requester.role === Role.LIDER_TECNICO && ip.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode apagar IPs da sua equipe')
    }

    await this.audit.log({
      action: 'DELETE',
      entity: 'IP',
      entityId: ip.id,
      details: `IP ${ip.address} apagado`,
      userId: requester.id,
    })

    return this.prisma.ip.delete({ where: { id } })
  }
}