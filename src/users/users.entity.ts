import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CreditApplication } from '../credit-applications/credit-application.entity';
import { CreditCalculation } from '../credit-calculations/credit-calculation.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ name: 'iduser' })
  id: number;

  @Column({ name: 'username', length: 45 })
  firstName: string;

  @Column({ name: 'usersurname', length: 45 })
  lastName: string;

  @Column({ name: 'usermail', length: 190, unique: true })
  email: string;

  @Column({ name: 'userpassword', length: 255 })
  password: string;

  @Column({ name: 'monthlyIncome', type: 'decimal', precision: 10, scale: 2, default: 5000 })
  monthlyIncome: number;

  // Computed property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Relationships
  @OneToMany(() => CreditApplication, creditApplication => creditApplication.user)
  creditApplications: CreditApplication[];

  @OneToMany(() => CreditCalculation, creditCalculation => creditCalculation.user)
  creditCalculations: CreditCalculation[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
