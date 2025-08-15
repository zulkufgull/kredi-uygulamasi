import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCalculationsService } from './credit-calculations.service';
import { CreditCalculationsController } from './credit-calculations.controller';
import { CreditCalculation } from './credit-calculation.entity';
import { CreditType } from '../credit-types/credit-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditCalculation, CreditType])],
  providers: [CreditCalculationsService],
  controllers: [CreditCalculationsController],
  exports: [CreditCalculationsService]
})
export class CreditCalculationsModule {} 