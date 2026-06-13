import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { Model } from './entities/model.entity';

// Módulo responsável pela gestão de modelos de veículos
@Module({
  // Registra a entidade Model no TypeORM
  imports: [TypeOrmModule.forFeature([Model])],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
