import { Controller, Get, Res } from '@nestjs/common'
import type { Response } from 'express'
import { FeedService } from './feed.service'

@Controller('feed')
export class FeedController {

  constructor(private readonly feedService: FeedService) {}

  @Get('ips')
  async getIpFeed(@Res() res: Response) {
    const feed = await this.feedService.getIpFeed()
    res.setHeader('Content-Type', 'text/plain')
    res.send(feed)
  }

  @Get('hashes')
  async getHashFeed(@Res() res: Response) {
    const feed = await this.feedService.getHashFeed()
    res.setHeader('Content-Type', 'text/plain')
    res.send(feed)
  }

  @Get('domains')
  async getDomainFeed(@Res() res: Response) {
    const feed = await this.feedService.getDomainFeed()
    res.setHeader('Content-Type', 'text/plain')
    res.send(feed)
  }
}