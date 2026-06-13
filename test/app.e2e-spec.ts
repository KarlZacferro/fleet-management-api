import * as crypto from 'crypto';
// Polyfill para resolver o erro 'crypto is not defined' no Node 18
if (!global.crypto) {
  (global as any).crypto = crypto;
}

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; // MUDANÇA AQUI: Importação padrão
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1'); 
    await app.init();
  });

  it('/api/v1 (GET)', () => {
    // Agora o 'request' pode ser chamado 
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
