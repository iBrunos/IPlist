import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { Role } from '../auth/roles.enum'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async create(data: any, requester: any) {
  if (requester.role === Role.TECNICO) {
    throw new ForbiddenException('Sem permissão para criar usuários')
  }

  if (requester.role === Role.LIDER_TECNICO) {
    if (data.role !== Role.TECNICO) {
      throw new ForbiddenException('Líder técnico só pode criar técnicos')
    }
    if (data.equipe !== requester.equipe) {
      throw new ForbiddenException('Só pode criar usuários da sua equipe')
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  try {
    return await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        equipe: data.equipe,
        role: data.role,
      }
    })
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Username ou email já existe')
    }
    throw error
  }
}

  async findAll(requester: any) {
    // lidertecnico só vê tecnicos da sua equipe
    if (requester.role === Role.LIDER_TECNICO) {
      return this.prisma.user.findMany({
        where: { equipe: requester.equipe, role: Role.TECNICO },
        select: { id: true, username: true, email: true, equipe: true, role: true, createdAt: true }
      })
    }

    return this.prisma.user.findMany({
      select: { id: true, username: true, email: true, equipe: true, role: true, createdAt: true }
    })
  }

  async update(id: string, data: any, requester: any) {
    const target = await this.prisma.user.findUnique({ where: { id } })

    if (!target) throw new NotFoundException('Usuário não encontrado')

    if (requester.role === Role.TECNICO) {
      throw new ForbiddenException('Sem permissão para editar usuários')
    }

    if (requester.role === Role.LIDER_TECNICO) {
      if (target.role !== Role.TECNICO || target.equipe !== requester.equipe) {
        throw new ForbiddenException('Só pode editar técnicos da sua equipe')
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, email: true, equipe: true, role: true }
    })
  }

  async remove(id: string, requester: any) {
    const target = await this.prisma.user.findUnique({ where: { id } })

    if (!target) throw new NotFoundException('Usuário não encontrado')

    if (requester.role === Role.TECNICO) {
      throw new ForbiddenException('Sem permissão para apagar usuários')
    }

    if (requester.role === Role.LIDER_TECNICO) {
      if (target.role !== Role.TECNICO || target.equipe !== requester.equipe) {
        throw new ForbiddenException('Só pode apagar técnicos da sua equipe')
      }
    }

    return this.prisma.user.delete({ where: { id } })
  }
}