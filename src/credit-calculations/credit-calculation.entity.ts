import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { CreditType } from '../credit-types/credit-type.entity';

@Entity('credit_calculations')
export class CreditCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number; // Anonim hesaplamalar için null olabilir

  @ManyToOne(() => CreditType)
  @JoinColumn({ name: 'creditTypeId' })
  creditType: CreditType;

  @Column()
  creditTypeId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'int' })
  requestedTerm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPayment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPayment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalInterest: number;

  @Column({ type: 'json' })
  paymentSchedule: object; // Taksit planı (JSON formatında)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyIncome: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  debtToIncomeRatio: number;

  @Column({ type: 'boolean', default: false })
  isEligible: boolean;

  @Column({ type: 'text', nullable: true })
  eligibilityNotes: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 500, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
} 