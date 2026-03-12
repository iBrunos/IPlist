import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: 'https://bip.salvador.ba.gov.br',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })

  await app.listen(3000)
}
bootstrap()