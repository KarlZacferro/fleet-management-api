import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Model } from '../../models/entities/model.entity';

// Define a classe como uma entidade do banco de dados vinculada à tabela 'vehicles'
@Entity('vehicles')
export class Vehicle {
  // Define o campo 'id' como chave primária gerada automaticamente (UUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Define a coluna 'license_plate' para armazenar a placa do veículo
  @Column()
  license_plate: string;

  // Define a coluna 'chassis' para armazenar o número do chassi do veículo
  @Column()
  chassis: string;

  // Define a coluna 'renavam' para armazenar o número do RENAVAM do veículo
  @Column()
  renavam: string;

  // Define a coluna 'year' para armazenar o ano de fabricação do veículo
  @Column()
  year: number;

  // Define a coluna 'created_at' que armazena automaticamente a data de criação do registro
  @CreateDateColumn()
  created_at: Date;

  // Define a coluna 'updated_at' que atualiza automaticamente a data sempre que o registro for modificado
  @UpdateDateColumn()
  updated_at: Date;

  // Define a coluna 'created_by' para armazenar o identificador do usuário que criou o registro
  @Column()
  created_by: string;

  // Estabelece uma relação de muitos para um com a entidade 'Model'
  // Vários veículos podem pertencer ao mesmo modelo
  @ManyToOne(() => Model, (model) => model.vehicles)
  @JoinColumn({ name: 'model_id' })
  model: Model;

  // Define explicitamente a coluna da chave estrangeira para facilitar o acesso ao ID do modelo
  @Column()
  model_id: string;
}
