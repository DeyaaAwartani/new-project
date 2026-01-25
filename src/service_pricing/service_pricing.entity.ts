import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceTypeEntity } from 'src/service_types/service_types.entity';
import { BillingPeriod } from './enums/billing-period.enum';

@Entity('service_pricing')
export class ServicePricingEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => ServiceTypeEntity, (t) => t.pricing, { onDelete: 'CASCADE' })
  serviceType: ServiceTypeEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string; // USD / JOD

  @Column({ type: 'enum', enum: BillingPeriod })
  period: BillingPeriod;

  @Column({ type: 'int', default: 1 })
  periodCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
