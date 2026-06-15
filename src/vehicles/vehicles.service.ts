import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Model } from '../models/entities/model.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Model) private modelRepository: Repository<Model>,
  ) {}

  async create(createVehicleDto: any, userId: string) {
    const model = await this.modelRepository.findOne({ where: { id: createVehicleDto.model_id } });
    if (!model) {
      throw new BadRequestException('O modelo informado (model_id) não existe.');
    }

    const existingVehicle = await this.vehicleRepository.findOne({ 
      where: { license_plate: createVehicleDto.license_plate } 
    });
    if (existingVehicle) {
      throw new BadRequestException('Já existe um veículo cadastrado com esta placa.');
    }

    const vehicle = this.vehicleRepository.create({ ...createVehicleDto, created_by: userId });
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.vehicleRepository.find({ 
      relations: { model: { brand: true } } 
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ 
      where: { id }, 
      relations: { model: { brand: true } } 
    });
    if (!vehicle) throw new NotFoundException(`Veículo ${id} não encontrado`);
    return vehicle;
  }

  async update(id: string, updateVehicleDto: any): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    // Se estiver tentando atualizar o modelo, valida se o novo modelo existe
    if (updateVehicleDto.model_id && updateVehicleDto.model_id !== vehicle.model_id) {
      const model = await this.modelRepository.findOne({ where: { id: updateVehicleDto.model_id } });
      if (!model) {
        throw new BadRequestException('O novo modelo informado (model_id) não existe.');
      }
    }

    // Se estiver tentando atualizar a placa, valida se a nova placa já não pertence a outro veículo
    if (updateVehicleDto.license_plate && updateVehicleDto.license_plate !== vehicle.license_plate) {
      const existingVehicle = await this.vehicleRepository.findOne({ 
        where: { license_plate: updateVehicleDto.license_plate } 
      });
      if (existingVehicle) {
        throw new BadRequestException('Já existe outro veículo cadastrado com esta placa.');
      }
    }

    const updated = this.vehicleRepository.merge(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
  }
}