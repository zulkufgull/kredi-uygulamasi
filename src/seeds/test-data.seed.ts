import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { CreditType } from '../credit-types/credit-type.entity';
import { CreditApplication, ApplicationStatus } from '../credit-applications/credit-application.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TestDataSeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditType)
    private readonly creditTypeRepository: Repository<CreditType>,
    @InjectRepository(CreditApplication)
    private readonly creditApplicationRepository: Repository<CreditApplication>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async seed() {
    console.log('Test verileri yükleniyor...');

    // Kullanıcıları kontrol et
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      console.log('Test kullanıcıları oluşturuluyor...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const testUsers = [
        {
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          email: 'ahmet.yilmaz@example.com',
          password: hashedPassword,
        },
        {
          firstName: 'Fatma',
          lastName: 'Demir',
          email: 'fatma.demir@example.com',
          password: hashedPassword,
        },
        {
          firstName: 'Mehmet',
          lastName: 'Kaya',
          email: 'mehmet.kaya@example.com',
          password: hashedPassword,
        },
      ];

      for (const userData of testUsers) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
      }
    } else {
      console.log('Test kullanıcıları zaten mevcut, atlanıyor...');
    }

    // Kredi türlerini kontrol et
    const creditTypeCount = await this.creditTypeRepository.count();
    if (creditTypeCount === 0) {
      console.log('Kredi türleri oluşturuluyor...');
      
      const creditTypes = [
        {
          name: 'İhtiyaç Kredisi',
          description: 'Günlük ihtiyaçlar için kısa vadeli kredi',
          minAmount: 1000,
          maxAmount: 50000,
          minTerm: 3,
          maxTerm: 36,
          interestRate: 2.5,
          isActive: true,
        },
        {
          name: 'Konut Kredisi',
          description: 'Ev alımı için uzun vadeli kredi',
          minAmount: 50000,
          maxAmount: 2000000,
          minTerm: 60,
          maxTerm: 360,
          interestRate: 1.8,
          isActive: true,
        },
        {
          name: 'Taşıt Kredisi',
          description: 'Araç alımı için orta vadeli kredi',
          minAmount: 10000,
          maxAmount: 300000,
          minTerm: 12,
          maxTerm: 60,
          interestRate: 2.2,
          isActive: true,
        },
      ];

      for (const creditTypeData of creditTypes) {
        const creditType = this.creditTypeRepository.create(creditTypeData);
        await this.creditTypeRepository.save(creditType);
      }
    } else {
      console.log('Kredi türleri zaten mevcut, atlanıyor...');
    }

    // Kredi başvurularını kontrol et
    const applicationCount = await this.creditApplicationRepository.count();
    if (applicationCount === 0) {
      console.log('Test kredi başvuruları oluşturuluyor...');
      
      const users = await this.userRepository.find();
      const creditTypes = await this.creditTypeRepository.find();
      
      if (users.length > 0 && creditTypes.length > 0) {
        const applications = [
          {
            applicationNumber: 'APP001',
            userId: users[0].id,
            creditTypeId: creditTypes[0].id,
            requestedAmount: 10000,
            requestedTerm: 12,
            status: ApplicationStatus.APPROVED,
            approvedAmount: 10000,
            approvedTerm: 12,
            approvedInterestRate: 2.5,
            monthlyPayment: 850,
            totalPayment: 10200,
          },
          {
            applicationNumber: 'APP002',
            userId: users[1].id,
            creditTypeId: creditTypes[1].id,
            requestedAmount: 100000,
            requestedTerm: 120,
            status: ApplicationStatus.PENDING,
          },
        ];

        for (const appData of applications) {
          const application = this.creditApplicationRepository.create(appData);
          await this.creditApplicationRepository.save(application);
        }
      }
    } else {
      console.log('Test kredi başvuruları zaten mevcut, atlanıyor...');
    }

    // Ödemeleri kontrol et
    const paymentCount = await this.paymentRepository.count();
    if (paymentCount === 0) {
      console.log('Test ödemeleri oluşturuluyor...');
      
      const applications = await this.creditApplicationRepository.find({
        where: { status: ApplicationStatus.APPROVED },
      });
      
      if (applications.length > 0) {
        const application = applications[0];
        const monthlyPayment = application.monthlyPayment || 850;
        
        for (let i = 1; i <= 12; i++) {
          const payment = this.paymentRepository.create({
            paymentNumber: `PAY${application.id}${i.toString().padStart(2, '0')}`,
            creditApplicationId: application.id,
            installmentNumber: i,
            amount: monthlyPayment,
            principalAmount: monthlyPayment * 0.7,
            interestAmount: monthlyPayment * 0.3,
            status: i <= 3 ? PaymentStatus.PAID : PaymentStatus.PENDING,
            dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000),
            remainingBalance: monthlyPayment * (12 - i),
          });
          
          await this.paymentRepository.save(payment);
        }
      }
    } else {
      console.log('Test ödemeleri zaten mevcut, atlanıyor...');
    }

    console.log('Tüm test verileri başarıyla yüklendi!');
  }
} 