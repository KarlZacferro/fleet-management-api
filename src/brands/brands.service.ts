import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  // Ajustado para receber o userId e realizar a auditoria
  async create(createBrandDto: CreateBrandDto, userId: string): Promise<Brand> {
    const brand = this.brandRepository.create({
      ...createBrandDto,
      created_by: userId, // Salva o ID do usuário que criou a marca
    });
    return await this.brandRepository.save(brand);
  }

  async findAll(): Promise<Brand[]> {
    return await this.brandRepository.find();
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Marca com ID ${id} não encontrada`);
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    const updatedBrand = this.brandRepository.merge(brand, updateBrandDto);
    return await this.brandRepository.save(updatedBrand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandRepository.remove(brand);
  }
}