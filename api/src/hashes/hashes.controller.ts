import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common'
import { HashesService } from './hashes.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'

@Controller('hashes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HashesController {

  constructor(private readonly hashesService: HashesService) {}

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.hashesService.create(body, req.user)
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
  ) {
    return this.hashesService.findAll(req.user, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    })
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.hashesService.approve(id, req.user)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.hashesService.update(id, body, req.user)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.hashesService.remove(id, req.user)
  }
}