import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CreditApplication } from '../credit-applications/credit-application.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  LATE = 'late',
  DEFAULTED = 'defaulted'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
  CHECK = 'check'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  paymentNumber: string; // Otomatik oluşturulan ödeme numarası

  @ManyToOne(() => CreditApplication)
  @JoinColumn({ name: 'creditApplicationId' })
  creditApplication: CreditApplication;

  @Column()
  creditApplicationId: number;

  @Column({ type: 'int' })
  installmentNumber: number; // Hangi taksit

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // Ödeme tutarı

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  principalAmount: number; // Anapara tutarı

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  interestAmount: number; // Faiz tutarı

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFee: number; // Gecikme faizi

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'date' })
  dueDate: Date; // Son ödeme tarihi

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date; // Ödeme yapıldığı tarih

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  paymentDetails: object; // Ödeme detayları (JSON formatında)

  @Column({ type: 'boolean', default: false })
  isAutoPayment: boolean; // Otomatik ödeme mi

  @Column({ length: 100, nullable: true })
  transactionId: string; // Banka işlem numarası

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  remainingBalance: number; // Kalan anapara

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 