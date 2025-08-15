import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from './payment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserOwnershipGuard } from '../auth/user-ownership.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('schedule/:creditApplicationId')
  @HttpCode(HttpStatus.CREATED)
  async createPaymentSchedule(@Param('creditApplicationId', ParseIntPipe) creditApplicationId: number) {
    return this.paymentsService.createPaymentSchedule(creditApplicationId);
  }

  @Post(':id/pay')
  async makePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() paymentData: {
      paymentMethod: PaymentMethod;
      transactionId?: string;
      notes?: string;
      paymentDetails?: object;
    }
  ) {
    return this.paymentsService.makePayment(id, paymentData);
  }

  @Get('credit-application/:creditApplicationId')
  async getPaymentsByCreditApplication(@Param('creditApplicationId', ParseIntPipe) creditApplicationId: number) {
    return this.paymentsService.getPaymentsByCreditApplication(creditApplicationId);
  }

  @Get(':id')
  async getPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.getPaymentById(id);
  }

  @Get('number/:paymentNumber')
  async getPaymentByNumber(@Param('paymentNumber') paymentNumber: string) {
    return this.paymentsService.getPaymentByNumber(paymentNumber);
  }

  @Get('status/pending')
  async getPendingPayments() {
    return this.paymentsService.getPendingPayments();
  }

  @Get('status/late')
  async getLatePayments() {
    return this.paymentsService.getLatePayments();
  }

  @Get('status/defaulted')
  async getDefaultedPayments() {
    return this.paymentsService.getDefaultedPayments();
  }

  @Get('summary/:creditApplicationId')
  async getPaymentSummary(@Param('creditApplicationId', ParseIntPipe) creditApplicationId: number) {
    return this.paymentsService.getPaymentSummary(creditApplicationId);
  }

  // User-focused endpoints
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getUserPayments(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentsService.getUserPayments(userId);
  }

  @Get('user/:userId/pending')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getUserPendingPayments(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentsService.getUserPendingPayments(userId);
  }

  @Get('user/:userId/late')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getUserLatePayments(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentsService.getUserLatePayments(userId);
  }

  @Get('user/:userId/summary')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getUserPaymentSummary(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentsService.getUserPaymentSummary(userId);
  }

  @Post('user/:userId/pay/:paymentId')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async makeUserPayment(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() paymentData: {
      paymentMethod: PaymentMethod;
      transactionId?: string;
      notes?: string;
      paymentDetails?: object;
    }
  ) {
    return this.paymentsService.makeUserPayment(userId, paymentId, paymentData);
  }

  @Get('user/:userId/credit/:creditApplicationId')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getUserCreditPayments(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('creditApplicationId', ParseIntPipe) creditApplicationId: number
  ) {
    return this.paymentsService.getUserCreditPayments(userId, creditApplicationId);
  }
} 