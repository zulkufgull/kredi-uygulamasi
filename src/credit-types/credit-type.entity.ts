import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CreditApplication } from '../credit-applications/credit-application.entity';

@Entity('credit_types')
export class CreditType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number; // Yıllık faiz oranı (%)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxAmount: number;

  @Column({ type: 'int' })
  minTerm: number; // Ay cinsinden

  @Column({ type: 'int' })
  maxTerm: number; // Ay cinsinden

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number; // Komisyon oranı (%)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  requirements: object; // Gereksinimler (JSON formatında)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CreditApplication, creditApplication => creditApplication.creditType)
  creditApplications: CreditApplication[];
} 