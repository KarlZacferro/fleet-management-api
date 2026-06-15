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
    const updated = this.vehicleRepository.merge(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
  }
}