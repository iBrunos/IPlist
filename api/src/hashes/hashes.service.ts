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

  async findAll(requester: any) {
    if (requester.role === Role.TECNICO) {
      return this.prisma.hash.findMany({
        where: { createdById: requester.id }
      })
    }

    if (requester.role === Role.LIDER_TECNICO) {
      return this.prisma.hash.findMany({
        where: { createdBy: { equipe: requester.equipe } },
        include: { createdBy: { select: { username: true, equipe: true } } }
      })
    }

    return this.prisma.hash.findMany({
      include: { createdBy: { select: { username: true, equipe: true } } }
    })
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