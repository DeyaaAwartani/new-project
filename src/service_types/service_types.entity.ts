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
  Unique,
} from 'typeorm';
import { ServiceEntity } from 'src/services/services.entity';
import { ServicePricingEntity } from 'src/service_pricing/service_pricing.entity';

@Unique('UQ_service_types_service_code', ['serviceId', 'code'])
@Entity('service_types')
export class ServiceTypeEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Index('IDX_service_types_serviceId')
  @Column({ type: 'int' })
  serviceId: number;

  @ManyToOne(() => ServiceEntity, (s) => s.types, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: ServiceEntity;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 60 })
  code: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ServicePricingEntity, (p) => p.serviceType)
  pricing: ServicePricingEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
