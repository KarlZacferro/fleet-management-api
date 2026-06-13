import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

// Serviço para gerenciamento de usuários
@Injectable()
export class UsersService {
  constructor(
    // Injeta o repositório da entidade User
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Busca um usuário pelo email (usado no login)
  // O 'addSelect' é usado para incluir a senha que está oculta por padrão na entidade
  async findByEmail(email: string): Promise<User | undefined> {
  const user = await this.userRepository.createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email = :email', { email })
    .getOne();
  return user ?? undefined; // Garante que retorna undefined em vez de null
}

  // Busca um usuário pelo ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }
async findAll(): Promise<User[]> {
  return await this.userRepository.find();
}

async update(id: string, updateUserDto: any): Promise<User> {
  const user = await this.findOne(id);
  const updatedUser = this.userRepository.merge(user, updateUserDto);
  return await this.userRepository.save(updatedUser);
}

async remove(id: string): Promise<void> {
  const user = await this.findOne(id);
  await this.userRepository.remove(user);
}
  // Cria um novo usuário (usado no seed ou registro)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }
}
