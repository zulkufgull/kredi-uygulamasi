import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { CreditType } from '../credit-types/credit-type.entity';
import { CreditApplication } from '../credit-applications/credit-application.entity';
import { Payment } from '../payments/payment.entity';
import { TestDataSeedService } from './test-data.seed';

@Injectable()
export class SeedsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditType)
    private readonly creditTypeRepository: Repository<CreditType>,
    @InjectRepository(CreditApplication)
    private readonly creditApplicationRepository: Repository<CreditApplication>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly testDataSeedService: TestDataSeedService,
  ) {}

  async seed() {
    console.log('Seed işlemi başlatılıyor...');

    try {
      // Test verilerini yükle
      await this.testDataSeedService.seed();
      
      console.log('Seed işlemi başarıyla tamamlandı!');
    } catch (error) {
      console.error('Seed işlemi sırasında hata:', error);
      throw error;
    }
  }
} 