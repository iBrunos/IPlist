import { Module } from '@nestjs/common'
import { IpsController } from './ips.controller'
import { IpsService } from './ips.service'
import { PrismaService } from '../database/prisma.service'

@Module({
  controllers: [IpsController],
  providers: [IpsService, PrismaService],
})
export class IpsModule {}