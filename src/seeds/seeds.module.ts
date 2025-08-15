import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedsService } from './seeds.service';
import { TestDataSeedService } from './test-data.seed';
import { User } from '../users/users.entity';
import { CreditType } from '../credit-types/credit-type.entity';
import { CreditApplication } from '../credit-applications/credit-application.entity';
import { Payment } from '../payments/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CreditType, CreditApplication, Payment]),
  ],
  providers: [SeedsService, TestDataSeedService],
  exports: [SeedsService],
})
export class SeedsModule {} 