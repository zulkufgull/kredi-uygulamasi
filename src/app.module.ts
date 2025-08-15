import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CreditTypesModule } from './credit-types/credit-types.module';
import { CreditApplicationsModule } from './credit-applications/credit-applications.module';
import { CreditCalculationsModule } from './credit-calculations/credit-calculations.module';
import { PaymentsModule } from './payments/payments.module';
import { SeedsModule } from './seeds/seeds.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/users.entity';
import { CreditType } from './credit-types/credit-type.entity';
import { CreditApplication } from './credit-applications/credit-application.entity';
import { CreditCalculation } from './credit-calculations/credit-calculation.entity';
import { Payment } from './payments/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'Bataryaz6',
      database: process.env.DB_DATABASE || 'credit_app',
      entities: [User, CreditType, CreditApplication, CreditCalculation, Payment],
      synchronize: process.env.NODE_ENV !== 'production', // Geliştirme ortamında true, production'da false
      logging: process.env.NODE_ENV !== 'production',
      charset: 'utf8mb4',
    }),
    UsersModule,
    CreditTypesModule,
    CreditApplicationsModule,
    CreditCalculationsModule,
    PaymentsModule,
    SeedsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
