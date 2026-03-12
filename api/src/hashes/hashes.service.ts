import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { AuditService } from '../audit/audit.service'
import { Role } from '../auth/roles.enum'

@Injectable()
export class HashesService {

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(data: any, requester: any) {
    const status = requester.role === Role.TECNICO ? 'pending' : 'approved'

    const hash = await this.prisma.hash.create({
      data: {
        value: data.value,
        type: data.type,
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status,
        createdById: requester.id,
        approvedById: status === 'approved' ? requester.id : null,
      }
    })

    await this.audit.log({
      action: 'CREATE',
      entity: 'HASH',
      entityId: hash.id,
      details: `Hash ${hash.value} (${hash.type}) criada com status ${status}`,
      userId: requester.id,
    })

    return hash
  }

async findAll(requester: any, { page = 1, limit = 10, search = '' } = {}) {
  const skip = (page - 1) * limit

  const searchFilter = search ? {
    OR: [
      { value: { contains: search, mode: 'insensitive' as const } },
      { type: { contains: search, mode: 'insensitive' as const } },
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
    this.prisma.hash.findMany({
      where: finalWhere,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { username: true, equipe: true } } },
    }),
    this.prisma.hash.count({ where: finalWhere }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

  async approve(id: string, requester: any) {
    if (requester.role === Role.TECNICO) {
      throw new ForbiddenException('Sem permissão para aprovar')
    }

    const hash = await this.prisma.hash.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!hash) throw new NotFoundException('Hash não encontrada')

    if (requester.role === Role.LIDER_TECNICO && hash.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode aprovar hashes da sua equipe')
    }

    const updated = await this.prisma.hash.update({
      where: { id },
      data: { status: 'approved', approvedById: requester.id }
    })

    await this.audit.log({
      action: 'APPROVE',
      entity: 'HASH',
      entityId: hash.id,
      details: `Hash ${hash.value} aprovada`,
      userId: requester.id,
    })

    return updated
  }

  async update(id: string, data: any, requester: any) {
    const hash = await this.prisma.hash.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!hash) throw new NotFoundException('Hash não encontrada')

    if (requester.role === Role.TECNICO && hash.createdById !== requester.id) {
      throw new ForbiddenException('Só pode editar suas próprias hashes')
    }

    if (requester.role === Role.LIDER_TECNICO && hash.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode editar hashes da sua equipe')
    }

    const updated = await this.prisma.hash.update({
      where: { id },
      data: {
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }
    })

    await this.audit.log({
      action: 'UPDATE',
      entity: 'HASH',
      entityId: hash.id,
      details: `Hash ${hash.value} editada`,
      userId: requester.id,
    })

    return updated
  }

  async remove(id: string, requester: any) {
    const hash = await this.prisma.hash.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!hash) throw new NotFoundException('Hash não encontrada')

    if (requester.role === Role.TECNICO && hash.createdById !== requester.id) {
      throw new ForbiddenException('Só pode apagar suas próprias hashes')
    }

    if (requester.role === Role.LIDER_TECNICO && hash.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode apagar hashes da sua equipe')
    }

    await this.audit.log({
      action: 'DELETE',
      entity: 'HASH',
      entityId: hash.id,
      details: `Hash ${hash.value} apagada`,
      userId: requester.id,
    })

    return this.prisma.hash.delete({ where: { id } })
  }
}