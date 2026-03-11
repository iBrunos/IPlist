import { Module } from '@nestjs/common'
import { HashesController } from './hashes.controller'
import { HashesService } from './hashes.service'
import { PrismaService } from '../database/prisma.service'

@Module({
  controllers: [HashesController],
  providers: [HashesService, PrismaService],
})
export class HashesModule {}