//Essa linha no topo e para resolver o erro 'crypto is not defined' no Node 18
import * as crypto from 'crypto';
if (!global.crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configura o prefixo global
  app.setGlobalPrefix('api/v1');

  // Habilita a validação global de dados
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(3000);
  console.log(`Aplicação rodando em: ${await app.getUrl()}`);
}
bootstrap();
