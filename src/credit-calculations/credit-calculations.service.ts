import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCalculation } from './credit-calculation.entity';
import { CreditType } from '../credit-types/credit-type.entity';

export interface PaymentScheduleItem {
  installment: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface CreditCalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  paymentSchedule: PaymentScheduleItem[];
  isEligible: boolean;
  eligibilityNotes: string;
  debtToIncomeRatio: number;
}

@Injectable()
export class CreditCalculationsService {
  constructor(
    @InjectRepository(CreditCalculation)
    private creditCalculationRepository: Repository<CreditCalculation>,
    @InjectRepository(CreditType)
    private creditTypeRepository: Repository<CreditType>,
  ) {}

  async calculateCredit(
    amount: number,
    term: number,
    creditTypeId: number,
    monthlyIncome?: number,
    userId?: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<CreditCalculationResult> {
    const creditType = await this.creditTypeRepository.findOne({
      where: { id: creditTypeId }
    });

    if (!creditType) {
      throw new Error('Kredi türü bulunamadı');
    }

    // Kredi hesaplama
    const monthlyInterestRate = creditType.interestRate / 100 / 12;
    const monthlyPayment = this.calculateMonthlyPayment(amount, monthlyInterestRate, term);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    // Taksit planı oluştur
    const paymentSchedule = this.generatePaymentSchedule(amount, monthlyInterestRate, term, monthlyPayment);

    // Borç-gelir oranı hesapla
    const debtToIncomeRatio = monthlyIncome ? (monthlyPayment / monthlyIncome) * 100 : 0;

    // Uygunluk kontrolü
    const isEligible = this.checkEligibility(amount, term, creditType, debtToIncomeRatio);
    const eligibilityNotes = this.generateEligibilityNotes(amount, term, creditType, debtToIncomeRatio, isEligible);

    // Hesaplama sonucunu kaydet
    const calculation = this.creditCalculationRepository.create({
      userId,
      creditTypeId,
      requestedAmount: amount,
      requestedTerm: term,
      interestRate: creditType.interestRate,
      monthlyPayment,
      totalPayment,
      totalInterest,
      paymentSchedule,
      monthlyIncome,
      debtToIncomeRatio,
      isEligible,
      eligibilityNotes,
      ipAddress,
      userAgent
    });

    await this.creditCalculationRepository.save(calculation);

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      paymentSchedule,
      isEligible,
      eligibilityNotes,
      debtToIncomeRatio
    };
  }

  private calculateMonthlyPayment(principal: number, monthlyRate: number, term: number): number {
    if (monthlyRate === 0) {
      return principal / term;
    }
    
    const rate = monthlyRate;
    const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return Math.round(payment * 100) / 100; // 2 ondalık basamağa yuvarla
  }

  private generatePaymentSchedule(
    principal: number,
    monthlyRate: number,
    term: number,
    monthlyPayment: number
  ): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = [];
    let remainingBalance = principal;

    for (let i = 1; i <= term; i++) {
      const interest = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      remainingBalance -= principalPayment;

      schedule.push({
        installment: i,
        payment: monthlyPayment,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100)
      });
    }

    return schedule;
  }

  private checkEligibility(
    amount: number,
    term: number,
    creditType: CreditType,
    debtToIncomeRatio: number
  ): boolean {
    // Kredi limiti kontrolü
    if (amount < creditType.minAmount || amount > creditType.maxAmount) {
      return false;
    }

    // Vade kontrolü
    if (term < creditType.minTerm || term > creditType.maxTerm) {
      return false;
    }

    // Borç-gelir oranı kontrolü (genellikle %40'ın altında olmalı)
    if (debtToIncomeRatio > 40) {
      return false;
    }

    return true;
  }

  private generateEligibilityNotes(
    amount: number,
    term: number,
    creditType: CreditType,
    debtToIncomeRatio: number,
    isEligible: boolean
  ): string {
    if (isEligible) {
      return 'Kredi başvurunuz uygun görünmektedir.';
    }

    const notes: string[] = [];

    if (amount < creditType.minAmount) {
      notes.push(`Minimum kredi tutarı: ${creditType.minAmount} TL`);
    }

    if (amount > creditType.maxAmount) {
      notes.push(`Maksimum kredi tutarı: ${creditType.maxAmount} TL`);
    }

    if (term < creditType.minTerm) {
      notes.push(`Minimum vade: ${creditType.minTerm} ay`);
    }

    if (term > creditType.maxTerm) {
      notes.push(`Maksimum vade: ${creditType.maxTerm} ay`);
    }

    if (debtToIncomeRatio > 40) {
      notes.push('Borç-gelir oranınız çok yüksek (%40 üzeri)');
    }

    return notes.join(', ');
  }

  async findCalculationHistory(userId: number): Promise<CreditCalculation[]> {
    return this.creditCalculationRepository.find({
      where: { userId },
      relations: ['creditType'],
      order: { createdAt: 'DESC' }
    });
  }

  async findCalculationById(id: number): Promise<CreditCalculation | null> {
    return this.creditCalculationRepository.findOne({
      where: { id },
      relations: ['creditType', 'user']
    });
  }
} 