import type { Response } from 'express'
import { Controller, Get, Res } from '@nestjs/common'
import { FeedService } from './feed.service'

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('ips')
  async ips(@Res() res: Response) {
    const data = await this.feedService.getIps()
    res.setHeader('Content-Type', 'text/plain')
    res.send(data.join('\n'))
  }

  @Get('hashes')
  async hashes(@Res() res: Response) {
    const data = await this.feedService.getHashes()
    res.setHeader('Content-Type', 'text/plain')
    res.send(data.join('\n'))
  }

  @Get('domains')
  async domains(@Res() res: Response) {
    const data = await this.feedService.getDomains()
    res.setHeader('Content-Type', 'text/plain')
    res.send(data.join('\n'))
  }
}