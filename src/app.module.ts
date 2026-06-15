import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core'; // Adicionado para o Interceptor
import { redisStore } from 'cache-manager-redis-yet';

// Módulos de Negócio
import { BrandsModule } from './brands/brands.module';
import { ModelsModule } from './models/models.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

// Imports para o Logging
import { InteractionLog, InteractionLogSchema } from './common/schemas/log.schema';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // Configuração de Variáveis de Ambiente
    ConfigModule.forRoot({ isGlobal: true }),

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

    // Conexão Global com MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/fleet_management',
      }),
    }),

    // Configuração da Coleção de Logs no MongoDB
    MongooseModule.forFeature([
      { name: InteractionLog.name, schema: InteractionLogSchema }
    ]),

    // Configuração do Cache (Redis)
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
          console.warn('Redis indisponível. Usando cache em memória.');
          return {}; 
        }
      },
    }),

    BrandsModule, ModelsModule, VehiclesModule, UsersModule, AuthModule,
  ],
  providers: [
    // Registra o Interceptor Globalmente para capturar todas as rotas
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
