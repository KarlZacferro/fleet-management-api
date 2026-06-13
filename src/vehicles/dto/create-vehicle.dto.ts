import { IsString, IsNotEmpty, IsInt, Min, IsUUID } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty({ message: 'A placa do veículo é obrigatória' })
  license_plate!: string;

  @IsString()
  @IsNotEmpty({ message: 'O número do chassi é obrigatório' })
  chassis!: string;

  @IsString()
  @IsNotEmpty({ message: 'O número do RENAVAM é obrigatório' })
  renavam!: string;

  @IsInt()
  @Min(1900, { message: 'O ano do veículo deve ser válido' })
  year!: number;

  @IsUUID('all', { message: 'O ID do modelo deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID do modelo é obrigatório' })
  model_id!: string;
}
