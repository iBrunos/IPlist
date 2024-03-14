import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  try {
    const port = 3001; // Porta do servidor
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(bodyParser.json({ limit: '10mb' }));
    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://bladefall.vercel.app',
      ], // Lista de origens permitidas
      methods: 'GET, POST, PUT, DELETE, PATCH',
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    });
    // Inicialização do servidor
    await app.listen(port);
    console.log(
      `LOCAL:  200 🟢 | Server running locally on http://localhost:${port}/
      VERCEL: 200 🟢 | Server deployed at https://bladefall.vercel.app/
      Call support for help ONLY IF necessary.
      `,
    );

    // Manipulador de sinal para encerrar corretamente o servidor
    process.on('SIGINT', async () => {
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start the serverdd', error);
  }
}

bootstrap();