import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLog } from './../src/audit/schemas/audit-log.schema';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
  }, 30000);

  
  afterAll(async () => {
    if (app) {
      
      await app.close();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  it('/api/v1/users (GET) - Deve retornar 200 OK', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/users');
    
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
