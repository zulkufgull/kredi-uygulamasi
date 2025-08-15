import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { CreditType } from '../credit-types/credit-type.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

@Entity('credit_applications')
export class CreditApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  applicationNumber: string; // Otomatik oluşturulan başvuru numarası

  @ManyToOne(() => User, user => user.creditApplications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => CreditType, creditType => creditType.creditApplications)
  @JoinColumn({ name: 'creditTypeId' })
  creditType: CreditType;

  @Column()
  creditTypeId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  requestedAmount: number;

  @Column({ type: 'int' })
  requestedTerm: number; // Ay cinsinden

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'int', nullable: true })
  approvedTerm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  approvedInterestRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyPayment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPayment: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: ApplicationStatus.PENDING
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  documents: object; // Yüklenen belgeler (JSON formatında)

  @Column({ type: 'json', nullable: true })
  additionalInfo: object; // Ek bilgiler (JSON formatında)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditScore: number;

  @Column({ type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ type: 'datetime', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'int', nullable: true })
  reviewedBy: number; // Admin kullanıcı ID'si

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 