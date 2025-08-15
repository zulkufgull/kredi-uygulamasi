import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './payment.entity';
import { CreditApplication } from '../credit-applications/credit-application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, CreditApplication])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService]
})
export class PaymentsModule {} 