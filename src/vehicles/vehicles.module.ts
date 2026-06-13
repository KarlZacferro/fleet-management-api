import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';

// Módulo responsável pela gestão de veículos
@Module({
  // Registra a entidade Vehicle no TypeORM para este módulo
  imports: [TypeOrmModule.forFeature([Vehicle])],
  // Define o controlador que lidará com as rotas de veículos
  controllers: [VehiclesController],
  // Define o serviço que conterá a lógica de negócio
  providers: [VehiclesService],
  // Exporta o serviço para que possa ser usado em outros módulos se necessário
  exports: [VehiclesService],
})
export class VehiclesModule {}
