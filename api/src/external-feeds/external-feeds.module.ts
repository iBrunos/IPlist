import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ExternalFeedsService } from './external-feeds.service'
import { ExternalFeedsController } from './external-feeds.controller'
import { PrismaService } from '../database/prisma.service'

@Module({
  imports: [MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } })],
  controllers: [ExternalFeedsController],
  providers: [ExternalFeedsService, PrismaService],
})
export class ExternalFeedsModule {}