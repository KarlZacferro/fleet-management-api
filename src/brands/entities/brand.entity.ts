import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Model } from '../../models/entities/model.entity';

// Define a classe como uma entidade do banco de dados vinculada à tabela 'brands'
@Entity('brands')
export class Brand {
  // Define o campo 'id' como chave primária gerada automaticamente (UUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Define a coluna 'name' como texto obrigatório para o nome da marca
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

  // Estabelece uma relação de um para muitos com a entidade 'Model'
  // Uma marca pode possuir vários modelos associados
  @OneToMany(() => Model, (model) => model.brand)
  models: Model[];
}
