import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../auth/roles.enum'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  create(@Body() body: any, @Request() req: any) {
    return this.usersService.create(body, req.user)
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  findAll(@Request() req: any) {
    return this.usersService.findAll(req.user)
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.usersService.update(id, body, req.user)
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.usersService.remove(id, req.user)
  }
}