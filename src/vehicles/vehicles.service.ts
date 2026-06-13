import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, userId: string): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      created_by: userId,
    });
    const savedVehicle = await this.vehicleRepository.save(vehicle);
    
    try {
      await this.cacheManager.del('vehicles_list');
    } catch (error: any) {
      console.error('Erro ao limpar cache:', error.message);
    }
    
    return savedVehicle;
  }

  async findAll(): Promise<Vehicle[]> {
    try {
      const cachedVehicles = await this.cacheManager.get<Vehicle[]>('vehicles_list');
      if (cachedVehicles) {
        return cachedVehicles;
      }
    } catch (error: any) {
      console.error('Erro ao acessar o cache Redis:', error.message);
    }

    const vehicles = await this.vehicleRepository.find({ relations: { model: true } });

    try {
      await this.cacheManager.set('vehicles_list', vehicles, { ttl: 3600 } as any);
    } catch (error: any) {
      console.error('Erro ao salvar no cache Redis:', error.message);
    }

    return vehicles;
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: { model: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    const updatedVehicle = this.vehicleRepository.merge(vehicle, updateVehicleDto);
    const saved = await this.vehicleRepository.save(updatedVehicle);
    
    try {
      await this.cacheManager.del('vehicles_list');
    } catch (error: any) {
      console.error('Erro ao limpar cache:', error.message);
    }
    
    return saved;
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
    
    try {
      await this.cacheManager.del('vehicles_list');
    } catch (error: any) {
      console.error('Erro ao limpar cache:', error.message);
    }
  }
}
