import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Model } from '../../models/entities/model.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  license_plate!: string;

  @Column()
  chassis!: string;

  @Column()
  renavam!: string;

  @Column()
  year!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column()
  created_by!: string;

  @ManyToOne(() => Model, (model) => model.vehicles)
  @JoinColumn({ name: 'model_id' })
  model!: Model;

  @Column()
  model_id!: string;
}