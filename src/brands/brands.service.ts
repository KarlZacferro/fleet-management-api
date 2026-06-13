import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

// Define a classe como um provedor de serviço injetável para marcas
@Injectable()
export class BrandsService {
  constructor(
    // Injeta o repositório da entidade Brand
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  // Método para criar uma nova marca no sistema
  async create(createBrandDto: CreateBrandDto, userId: string): Promise<Brand> {
    // Cria a entidade com os dados do DTO e o ID do usuário responsável
    const brand = this.brandRepository.create({
      ...createBrandDto,
      created_by: userId,
    });
    // Salva a marca no banco de dados
    return await this.brandRepository.save(brand);
  }

  // Método para listar todas as marcas cadastradas
  async findAll(): Promise<Brand[]> {
    return await this.brandRepository.find();
  }

  // Método para buscar uma marca específica pelo ID
  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: { models: true }, // Inclui os modelos associados na resposta
    });
    // Lança erro se não encontrar a marca
    if (!brand) {
      throw new NotFoundException(`Marca com ID ${id} não encontrada`);
    }
    return brand;
  }

  // Método para atualizar os dados de uma marca
  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    const updatedBrand = this.brandRepository.merge(brand, updateBrandDto);
    return await this.brandRepository.save(updatedBrand);
  }

  // Método para remover uma marca
  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandRepository.remove(brand);
  }
}
