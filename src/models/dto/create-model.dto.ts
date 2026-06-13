import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do modelo é obrigatório' })
  name!: string; 

  @IsUUID('all', { message: 'O ID da marca deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID da marca é obrigatório' })
  brand_id!: string; 
}
