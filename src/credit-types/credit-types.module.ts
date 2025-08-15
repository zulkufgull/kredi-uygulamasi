import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditTypesService } from './credit-types.service';
import { CreditTypesController } from './credit-types.controller';
import { CreditType } from './credit-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditType])],
  providers: [CreditTypesService],
  controllers: [CreditTypesController],
  exports: [CreditTypesService]
})
export class CreditTypesModule {} 