import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ServiceEntity } from 'src/services/services.entity'; 
import { ServicePricingEntity } from 'src/service_pricing/service_pricing.entity'; 

@Entity('service_types')
export class ServiceTypeEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => ServiceEntity, (s) => s.types, { onDelete: 'CASCADE' })
  service: ServiceEntity;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  // @Column({ type: 'varchar', length: 60 })
  // code: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ServicePricingEntity, (p) => p.serviceType)
  pricing: ServicePricingEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
