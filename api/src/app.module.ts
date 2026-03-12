import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { IpsModule } from './ips/ips.module'
import { HashesModule } from './hashes/hashes.module'
import { DomainsModule } from './domains/domains.module'
import { AuditModule } from './audit/audit.module'
import { FeedModule } from './feed/feed.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { ExternalFeedsModule } from './external-feeds/external-feeds.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuditModule,
    AuthModule,
    UsersModule,
    IpsModule,
    HashesModule,
    DomainsModule,
    FeedModule,
    DashboardModule,
    ExternalFeedsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}