import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(Model) private modelRepository: Repository<Model>,
    @InjectRepository(Brand) private brandRepository: Repository<Brand>,
  ) {}

  async create(createModelDto: any, userId: string) {
    const brand = await this.brandRepository.findOne({ where: { id: createModelDto.brand_id } });
    if (!brand) {
      throw new BadRequestException('A marca informada (brand_id) não existe.');
    }
    const model = this.modelRepository.create({ ...createModelDto, created_by: userId });
    return await this.modelRepository.save(model);
  }

  async findAll(): Promise<Model[]> {
    return await this.modelRepository.find({ 
      relations: { brand: true } 
    });
  }

  async findOne(id: string): Promise<Model> {
    const model = await this.modelRepository.findOne({ 
      where: { id }, 
      relations: { brand: true } 
    });
    if (!model) throw new NotFoundException(`Modelo ${id} não encontrado`);
    return model;
  }

  async update(id: string, updateModelDto: any): Promise<Model> {
    const model = await this.findOne(id);
    const updated = this.modelRepository.merge(model, updateModelDto);
    return await this.modelRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const model = await this.findOne(id);
    await this.modelRepository.remove(model);
  }
}