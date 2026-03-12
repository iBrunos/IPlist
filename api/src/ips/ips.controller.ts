import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common'
import { IpsService } from './ips.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'

@Controller('ips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IpsController {

  constructor(private readonly ipsService: IpsService) {}

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.ipsService.create(body, req.user)
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
  ) {
    return this.ipsService.findAll(req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    })
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.ipsService.approve(id, req.user)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.ipsService.update(id, body, req.user)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.ipsService.remove(id, req.user)
  }
}