import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

// Objeto de transferência de dados para criação de usuários
export class CreateUserDto {
  // Nome curto ou apelido do usuário
  @IsString()
  @IsNotEmpty({ message: 'O nickname é obrigatório' })
  nickname: string;

  // Nome completo do usuário
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório' })
  name: string;

  // Email válido para autenticação
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

  // Senha com tamanho mínimo para segurança
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;
}
