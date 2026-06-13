import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

// Módulo responsável pela gestão de usuários e segurança
@Module({
  // Registra a entidade User no TypeORM
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporta para ser usado no AuthModule
})
export class UsersModule {}
