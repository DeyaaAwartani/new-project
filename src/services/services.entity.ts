import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceCategoryEntity } from 'src/service_categories/service_categories.entity'; 
import { ServiceTypeEntity } from 'src/service_types/service_types.entity';

@Entity('services')
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => ServiceCategoryEntity, (c) => c.services, { onDelete: 'RESTRICT' })
  category: ServiceCategoryEntity;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ServiceTypeEntity, (t) => t.service)
  types: ServiceTypeEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
