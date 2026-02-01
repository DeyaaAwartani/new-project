import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ServiceTypeEntity } from 'src/service_types/service_types.entity';
import { BillingPeriod } from './enums/billing-period.enum';

@Unique('UQ_pricing_type_currency_period_count', [
  'serviceTypeId',
  'currency',
  'period',
  'periodCount',
])
@Entity('service_pricing')
export class ServicePricingEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Index('IDX_service_pricing_serviceTypeId')
  @Column({ type: 'int' })
  serviceTypeId: number;

  @ManyToOne(() => ServiceTypeEntity, (t) => t.pricing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceTypeId' })
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
