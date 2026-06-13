import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Define a classe como uma entidade do banco de dados vinculada à tabela 'users'
@Entity('users')
export class User {
  // Define o campo 'id' como chave primária gerada automaticamente (UUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Define a coluna 'nickname' como texto obrigatório para o nome curto do usuário
  @Column()
  nickname: string;

  // Define a coluna 'name' como texto obrigatório para o nome completo do usuário
  @Column()
  name: string;

  // Define a coluna 'email' como texto obrigatório e único no sistema
  @Column({ unique: true })
  email: string;

  // Define a coluna 'password' para armazenar a senha (será usada na autenticação)
  // O campo 'select: false' garante que a senha não seja retornada em consultas comuns por segurança
  @Column({ select: false })
  password: string;
}
