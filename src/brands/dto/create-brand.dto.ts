import { IsString, IsNotEmpty } from 'class-validator';

// Objeto de transferência de dados para criação de marcas
export class CreateBrandDto {
  // Valida que o nome da marca é uma string e não está vazio
  @IsString()
  @IsNotEmpty({ message: 'O nome da marca é obrigatório' })
  name: string;
}
