import { Injectable, Logger } from '@nestjs/common'
import RadiusClient from 'node-radius-client'

@Injectable()
export class RadiusService {
  private readonly logger = new Logger(RadiusService.name)
  private readonly secret = process.env.RADIUS_SECRET || 'bip'

  private readonly client = new RadiusClient({
    host: process.env.RADIUS_HOST || '10.201.131.11',
    hostPort: parseInt(process.env.RADIUS_PORT || '1812'),
  })

  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      const response = await this.client.accessRequest({
        secret: this.secret,
        attributes: [
          ['User-Name', username],
          ['User-Password', password],
        ],
      })

      return response.code === 'Access-Accept'
    } catch (err: any) {
      this.logger.error(`Erro RADIUS: ${err.message}`)
      return false
    }
  }
}