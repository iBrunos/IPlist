import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { AuditService } from '../audit/audit.service'
import { Role } from '../auth/roles.enum'

@Injectable()
export class DomainsService {

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(data: any, requester: any) {
    const status = requester.role === Role.TECNICO ? 'pending' : 'approved'

    const domain = await this.prisma.domain.create({
      data: {
        domain: data.domain,
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        status,
        createdById: requester.id,
        approvedById: status === 'approved' ? requester.id : null,
      }
    })

    await this.audit.log({
      action: 'CREATE',
      entity: 'DOMAIN',
      entityId: domain.id,
      details: `Domínio ${domain.domain} criado com status ${status}`,
      userId: requester.id,
    })

    return domain
  }

  async findAll(requester: any) {
    if (requester.role === Role.TECNICO) {
      return this.prisma.domain.findMany({
        where: { createdById: requester.id }
      })
    }

    if (requester.role === Role.LIDER_TECNICO) {
      return this.prisma.domain.findMany({
        where: { createdBy: { equipe: requester.equipe } },
        include: { createdBy: { select: { username: true, equipe: true } } }
      })
    }

    return this.prisma.domain.findMany({
      include: { createdBy: { select: { username: true, equipe: true } } }
    })
  }

  async approve(id: string, requester: any) {
    if (requester.role === Role.TECNICO) {
      throw new ForbiddenException('Sem permissão para aprovar')
    }

    const domain = await this.prisma.domain.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!domain) throw new NotFoundException('Domínio não encontrado')

    if (requester.role === Role.LIDER_TECNICO && domain.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode aprovar domínios da sua equipe')
    }

    const updated = await this.prisma.domain.update({
      where: { id },
      data: { status: 'approved', approvedById: requester.id }
    })

    await this.audit.log({
      action: 'APPROVE',
      entity: 'DOMAIN',
      entityId: domain.id,
      details: `Domínio ${domain.domain} aprovado`,
      userId: requester.id,
    })

    return updated
  }

  async update(id: string, data: any, requester: any) {
    const domain = await this.prisma.domain.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!domain) throw new NotFoundException('Domínio não encontrado')

    if (requester.role === Role.TECNICO && domain.createdById !== requester.id) {
      throw new ForbiddenException('Só pode editar seus próprios domínios')
    }

    if (requester.role === Role.LIDER_TECNICO && domain.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode editar domínios da sua equipe')
    }

    const updated = await this.prisma.domain.update({
      where: { id },
      data: {
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }
    })

    await this.audit.log({
      action: 'UPDATE',
      entity: 'DOMAIN',
      entityId: domain.id,
      details: `Domínio ${domain.domain} editado`,
      userId: requester.id,
    })

    return updated
  }

  async remove(id: string, requester: any) {
    const domain = await this.prisma.domain.findUnique({
      where: { id },
      include: { createdBy: true }
    })

    if (!domain) throw new NotFoundException('Domínio não encontrado')

    if (requester.role === Role.TECNICO && domain.createdById !== requester.id) {
      throw new ForbiddenException('Só pode apagar seus próprios domínios')
    }

    if (requester.role === Role.LIDER_TECNICO && domain.createdBy.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode apagar domínios da sua equipe')
    }

    await this.audit.log({
      action: 'DELETE',
      entity: 'DOMAIN',
      entityId: domain.id,
      details: `Domínio ${domain.domain} apagado`,
      userId: requester.id,
    })

    return this.prisma.domain.delete({ where: { id } })
  }
}