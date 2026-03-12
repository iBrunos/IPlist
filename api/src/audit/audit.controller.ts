import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common'
import { AuditService } from './audit.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../auth/roles.enum'

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {

  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search = '',
  ) {
    return this.auditService.findAll(req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    })
  }
}