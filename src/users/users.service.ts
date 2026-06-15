import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Cria um novo usuário com validação de e-mail duplicado
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. Verifica se o e-mail já está cadastrado
    const existingUser = await this.userRepository.findOne({ 
      where: { email: createUserDto.email } 
    });

    if (existingUser) {
      // Retorna erro 400 amigável em vez de erro 500 do banco
      throw new BadRequestException(`O e-mail ${createUserDto.email} já está em uso.`);
    }

    // 2. Cria e salva o novo usuário
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  // Busca um usuário pelo email (usado na autenticação)
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    return user ?? undefined;
  }

  // Busca todos os usuários
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Busca um usuário pelo ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  // Atualiza dados de um usuário
  async update(id: string, updateUserDto: any): Promise<User> {
    const user = await this.findOne(id);
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return await this.userRepository.save(updatedUser);
  }

  // Remove um usuário
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
