import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IpsModule } from './ips/ips.module'; // Importe o módulo de IPs

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI), // Mantenha a conexão global com o MongoDB
    UserModule,
    IpsModule, // Importe o módulo de IPs aqui
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
