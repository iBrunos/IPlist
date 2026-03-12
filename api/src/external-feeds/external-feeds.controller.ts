import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ExternalFeedsService } from './external-feeds.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../auth/roles.enum'

@Controller('external-feeds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExternalFeedsController {
  constructor(private readonly service: ExternalFeedsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  findAll() {
    return this.service.findAll()
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  create(@Body() body: any, @Request() req: any) {
    return this.service.create(body, req.user)
  }

  @Post('preview')
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  @UseInterceptors(FileInterceptor('file'))
  async preview(
    @UploadedFile() file: Express.Multer.File,
    @Body('content') content: string,
  ) {
    const text = file ? file.buffer.toString('utf-8') : content
    return this.service.previewContent(text)
  }

  @Post('import')
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  @UseInterceptors(FileInterceptor('file'))
  async importFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('content') content: string,
    @Body('name') name: string,
    @Request() req: any,
  ) {
    const text = file ? file.buffer.toString('utf-8') : content
    return this.service.importContent(text, name, req.user)
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }

  @Post(':id/sync')
  @Roles(Role.SUPER_ADMIN, Role.LIDER_TECNICO)
  sync(@Param('id') id: string) {
    return this.service.syncFeed(id)
  }
}