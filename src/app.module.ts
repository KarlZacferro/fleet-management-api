import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { BrandsModule } from './brands/brands.module';
import { ModelsModule } from './models/models.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true } ),
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
    BrandsModule, ModelsModule, VehiclesModule, UsersModule, AuthModule,
  ],
})
export class AppModule {}