// Polyfill para o módulo 'crypto' no Node.js 18.
// Necessário para o TypeORM e para os testes E2E funcionarem corretamente.
import * as crypto from 'crypto';
if (!global.crypto) {
  (global as any).crypto = crypto;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { redisStore } from 'cache-manager-redis-yet';
import { BrandsModule } from './brands/brands.module';
import { ModelsModule } from './models/models.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Banco não relacional: MongoDB via Mongoose (Auditoria)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://127.0.0.1:27017/fleet_audit',
      }),
    }),

    // Conexão com SQL Server (Dados Principais)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST') || '127.0.0.1',
        port: Number(configService.get<string>('DB_PORT') ?? 1434),
        username: configService.get<string>('DB_USERNAME') || 'sa',
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE') || 'master',
        autoLoadEntities: true,
        synchronize: true,
        extra: { trustServerCertificate: true },
      }),
    }),

    // Configuração do Cache com Redis
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          const store = await redisStore({
            socket: {
              host: configService.get<string>('REDIS_HOST') || '127.0.0.1',
              port: Number(configService.get<string>('REDIS_PORT') ?? 6379),
              reconnectStrategy: (retries) => Math.min(retries * 50, 500),
            },
            ttl: Number(configService.get<string>('REDIS_TTL') ?? 3600),
          });
          return { store };
        } catch (error) {
          return {}; // Fallback para memória se o Redis falhar
        }
      },
    }),

    BrandsModule,
    ModelsModule,
    VehiclesModule,
    UsersModule,
    AuthModule,
    AuditModule,
  ],
  providers: [
    // Registra o AuditInterceptor globalmente para capturar todas as requisições
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
