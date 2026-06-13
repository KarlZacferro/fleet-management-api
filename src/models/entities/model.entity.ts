import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

// Define a classe como uma entidade do banco de dados vinculada à tabela 'models'
@Entity('models')
export class Model {
  // Define o campo 'id' como chave primária gerada automaticamente (UUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Define a coluna 'name' como texto obrigatório para o nome do modelo
  @Column()
  name: string;

  // Define a coluna 'created_at' que armazena automaticamente a data de criação do registro
  @CreateDateColumn()
  created_at: Date;

  // Define a coluna 'updated_at' que atualiza automaticamente a data sempre que o registro for modificado
  @UpdateDateColumn()
  updated_at: Date;

  // Define a coluna 'created_by' para armazenar o identificador do usuário que criou o registro
  @Column()
  created_by: string;

  // Estabelece uma relação de muitos para um com a entidade 'Brand'
  // Vários modelos podem pertencer a uma mesma marca
  @ManyToOne(() => Brand, (brand) => brand.models)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  // Define explicitamente a coluna da chave estrangeira para facilitar o acesso ao ID da marca
  @Column({ nullable: true })
  brand_id: string;

  // Estabelece uma relação de um para muitos com a entidade 'Vehicle'
  // Um modelo pode ter vários veículos associados
  @OneToMany(() => Vehicle, (vehicle) => vehicle.model)
  vehicles: Vehicle[];
}
