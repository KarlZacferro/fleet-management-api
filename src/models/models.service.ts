import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

// Define a classe como um provedor de serviço injetável para modelos de veículos
@Injectable()
export class ModelsService {
  constructor(
    // Injeta o repositório da entidade Model
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
  ) {}

  // Método para criar um novo modelo no sistema
  async create(createModelDto: CreateModelDto, userId: string): Promise<Model> {
    // Cria a entidade com os dados do DTO e o ID do usuário logado
    const model = this.modelRepository.create({
      ...createModelDto,
      created_by: userId,
    });
    // Salva o modelo no banco de dados
    return await this.modelRepository.save(model);
  }

  // Método para listar todos os modelos cadastrados
  async findAll(): Promise<Model[]> {
    // Retorna todos os modelos incluindo a marca associada
    return await this.modelRepository.find({ relations: { brand: true } });
  }

  // Método para buscar um modelo específico pelo ID
  async findOne(id: string): Promise<Model> {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: { brand: true, vehicles: true }, // Inclui marca e veículos associados
    });
    // Lança erro se não encontrar o modelo
    if (!model) {
      throw new NotFoundException(`Modelo com ID ${id} não encontrado`);
    }
    return model;
  }

  // Método para atualizar os dados de um modelo
  async update(id: string, updateModelDto: UpdateModelDto): Promise<Model> {
    const model = await this.findOne(id);
    const updatedModel = this.modelRepository.merge(model, updateModelDto);
    return await this.modelRepository.save(updatedModel);
  }

  // Método para remover um modelo
  async remove(id: string): Promise<void> {
    const model = await this.findOne(id);
    await this.modelRepository.remove(model);
  }
}
