import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditApplicationsController } from './credit-applications.controller';
import { CreditApplicationsService } from './credit-applications.service';
import { CreditApplication } from './credit-application.entity';
import { CreditApprovalService } from './credit-approval.service';
import { User } from '../users/users.entity';
import { CreditType } from '../credit-types/credit-type.entity';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CreditApplication, User, CreditType]),
    PaymentsModule
  ],
  controllers: [CreditApplicationsController],
  providers: [CreditApplicationsService, CreditApprovalService],
  exports: [CreditApplicationsService, CreditApprovalService],
})
export class CreditApplicationsModule {} 