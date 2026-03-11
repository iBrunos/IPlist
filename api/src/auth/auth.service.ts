import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { AuditService } from '../audit/audit.service'
import { RadiusService } from './radius.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private audit: AuditService,
    private radius: RadiusService,
  ) {}

  async login(username: string, password: string) {
    // 1. Tenta login local
    const localUser = await this.prisma.user.findUnique({
      where: { username }
    })

    if (localUser) {
      const passwordValid = await bcrypt.compare(password, localUser.password)
      if (passwordValid) {
        return this.generateToken(localUser)
      }
    }

    // 2. Usuário não é local — pede MFA para AD
    return { mfa_required: true, username }
  }

  async loginWithMfa(username: string, password: string, token: string) {
    // Autentica no FAC via RADIUS com senha+token
    const success = await this.radius.authenticate(username, `${password}${token}`)

    if (!success) {
      throw new UnauthorizedException('Credenciais ou token inválidos')
    }

    // Busca ou cria usuário no banco
    let user = await this.prisma.user.findUnique({ where: { username } })

    if (!user) {
      // Usuário novo do AD — cria com role padrão tecnico
      // Role será atualizada pelo admin depois
      user = await this.prisma.user.create({
        data: {
          username,
          email: `${username}@adpms.local`,
          password: await bcrypt.hash(Math.random().toString(36), 10),
          equipe: 'AD',
          role: 'tecnico',
        }
      })
    }

    return this.generateToken(user)
  }

  private async generateToken(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      equipe: user.equipe,
    }

    await this.audit.log({
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      details: `Usuário ${user.username} fez login`,
      userId: user.id,
    })

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        equipe: user.equipe,
        role: user.role,
      }
    }
  }
}