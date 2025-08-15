import { Controller, Post, Get, Body, Param, ParseIntPipe, Query, Req, NotFoundException } from '@nestjs/common';
import { CreditCalculationsService, CreditCalculationResult } from './credit-calculations.service';
import type { Request } from 'express';

@Controller('credit-calculations')
export class CreditCalculationsController {
  constructor(private readonly creditCalculationsService: CreditCalculationsService) {}

  @Post('calculate')
  async calculateCredit(
    @Body() body: {
      amount: number;
      term: number;
      creditTypeId: number;
      monthlyIncome?: number;
      userId?: number;
    },
    @Req() request: Request
  ): Promise<CreditCalculationResult> {
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return this.creditCalculationsService.calculateCredit(
      body.amount,
      body.term,
      body.creditTypeId,
      body.monthlyIncome,
      body.userId,
      ipAddress,
      userAgent
    );
  }

  @Get('history/:userId')
  async getCalculationHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.creditCalculationsService.findCalculationHistory(userId);
  }

  @Get(':id')
  async getCalculationById(@Param('id', ParseIntPipe) id: number) {
    const calculation = await this.creditCalculationsService.findCalculationById(id);
    if (!calculation) {
      throw new NotFoundException('Hesaplama bulunamadı');
    }
    return calculation;
  }
} 