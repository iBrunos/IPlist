import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common'
import { DomainsService } from './domains.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'

@Controller('domains')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DomainsController {

  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.domainsService.create(body, req.user)
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
  ) {
    return this.domainsService.findAll(req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    })
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.domainsService.approve(id, req.user)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.domainsService.update(id, body, req.user)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.domainsService.remove(id, req.user)
  }
}