import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditApplication, ApplicationStatus } from './credit-application.entity';
import { User } from '../users/users.entity';
import { CreditType } from '../credit-types/credit-type.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class CreditApprovalService {
  constructor(
    @InjectRepository(CreditApplication)
    private creditApplicationRepository: Repository<CreditApplication>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CreditType)
    private creditTypeRepository: Repository<CreditType>,
    private paymentsService: PaymentsService,
  ) {}

  /**
   * Otomatik kredi onay sistemi
   * Aylık taksit < Aylık gelir ise otomatik onay
   */
  public async autoApproveCredit(applicationId: number): Promise<{
    approved: boolean;
    reason: string;
    monthlyPayment: number;
    incomeRatio: number;
  }> {
    const application = await this.creditApplicationRepository.findOne({
      where: { id: applicationId },
      relations: ['user', 'creditType'],
    });

    if (!application) {
      throw new Error('Kredi başvurusu bulunamadı');
    }

    // Debug log'ları ekle
    console.log(`🔍 DEBUG - Kredi başvurusu ${applicationId}:`);
    console.log(`   - Kullanıcı ID: ${application.user.id}`);
    console.log(`   - Aylık gelir: ${application.user.monthlyIncome}`);
    console.log(`   - Kredi tutarı: ${application.requestedAmount}`);
    console.log(`   - Vade: ${application.requestedTerm}`);
    console.log(`   - Faiz oranı: ${application.creditType.interestRate}%`);

    // Aylık taksit hesaplama
    const monthlyPayment = this.calculateMonthlyPayment(
      application.requestedAmount,
      application.requestedTerm,
      application.creditType.interestRate,
    );

    console.log(`   - Hesaplanan aylık taksit: ${monthlyPayment}`);

    // Gelir/taksit oranı
    const incomeRatio = application.user.monthlyIncome / monthlyPayment;

    console.log(`   - Gelir/Taksit oranı: ${incomeRatio.toFixed(2)}`);

    // Otomatik onay kriterleri
    const isAutoApproved = this.evaluateApprovalCriteria(
      application.user.monthlyIncome,
      monthlyPayment,
      incomeRatio,
    );

    console.log(`   - Otomatik onay sonucu: ${isAutoApproved ? 'ONAYLANDI' : 'MANUEL İNCELEME'}`);

    if (isAutoApproved) {
      // Otomatik onay
      await this.approveApplication(application, monthlyPayment);
      return {
        approved: true,
        reason: '✅ Otomatik onay: Kredi başvurunuz onaylandı!',
        monthlyPayment,
        incomeRatio,
      };
    } else {
      // Manuel inceleme gerekli
      await this.requireManualReview(application, monthlyPayment, incomeRatio);
      return {
        approved: false,
        reason: '⚠️ Manuel inceleme gerekli: Gelir yetersiz',
        monthlyPayment,
        incomeRatio,
      };
    }
  }

  /**
   * Aylık taksit hesaplama
   */
  private calculateMonthlyPayment(
    principal: number,
    term: number,
    annualInterestRate: number,
  ): number {
    const monthlyInterestRate = annualInterestRate / 100 / 12;
    const numberOfPayments = term;

    if (monthlyInterestRate === 0) {
      return principal / numberOfPayments;
    }

    const monthlyPayment =
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    return Math.round(monthlyPayment * 100) / 100; // 2 decimal places
  }

  /**
   * Onay kriterlerini değerlendir
   */
  private evaluateApprovalCriteria(
    monthlyIncome: number,
    monthlyPayment: number,
    incomeRatio: number,
  ): boolean {
    // Çok basit kriter: Aylık taksit < Aylık gelir ise onayla
    const isIncomeSufficient = monthlyIncome > monthlyPayment;

    // Sadece gelir yeterliyse onayla
    return isIncomeSufficient;
  }

  /**
   * Başvuruyu onayla
   */
  private async approveApplication(
    application: CreditApplication,
    monthlyPayment: number,
  ): Promise<void> {
    const totalPayment = monthlyPayment * application.requestedTerm;
    
    await this.creditApplicationRepository.update(application.id, {
      status: ApplicationStatus.APPROVED,
      approvedAmount: application.requestedAmount,
      approvedTerm: application.requestedTerm,
      approvedInterestRate: application.creditType.interestRate,
      monthlyPayment,
      totalPayment,
      reviewedAt: new Date(),
      notes: '🎉 Otomatik onay: Kredi başvurunuz başarıyla onaylandı!',
    });

    // Ödeme planı oluştur
    console.log(`🔄 Ödeme planı oluşturuluyor: Kredi başvurusu ${application.id}`);
    console.log(`   - Kredi tutarı: ${application.requestedAmount} TL`);
    console.log(`   - Vade: ${application.requestedTerm} ay`);
    console.log(`   - Aylık taksit: ${monthlyPayment} TL`);
    
    try {
      console.log(`📞 PaymentsService.createPaymentSchedule çağrılıyor...`);
      const paymentSchedule = await this.paymentsService.createPaymentSchedule(application.id);
      console.log(`✅ Ödeme planı oluşturuldu: Kredi başvurusu ${application.id}`);
      console.log(`   - Oluşturulan taksit sayısı: ${paymentSchedule.length}`);
      console.log(`   - İlk taksit: ${paymentSchedule[0]?.amount} TL`);
      console.log(`   - Son taksit: ${paymentSchedule[paymentSchedule.length - 1]?.amount} TL`);
    } catch (error) {
      console.error(`❌ Ödeme planı oluşturulamadı: ${error.message}`);
      console.error(`   - Hata detayı:`, error);
      console.error(`   - Stack trace:`, error.stack);
    }
  }

  /**
   * Manuel inceleme gerekli
   */
  private async requireManualReview(
    application: CreditApplication,
    monthlyPayment: number,
    incomeRatio: number,
  ): Promise<void> {
    await this.creditApplicationRepository.update(application.id, {
      status: ApplicationStatus.PENDING,
      notes: `Manuel inceleme gerekli. Gelir/Taksit oranı: ${incomeRatio.toFixed(2)}`,
    });
  }

  /**
   * Kredi skoru hesaplama
   */
  calculateCreditScore(
    monthlyIncome: number,
    monthlyPayment: number,
    existingCredits: number,
  ): number {
    let score = 0;

    // Gelir skoru (0-40 puan)
    const incomeRatio = monthlyIncome / monthlyPayment;
    if (incomeRatio >= 3.0) score += 40;
    else if (incomeRatio >= 2.5) score += 35;
    else if (incomeRatio >= 2.0) score += 30;
    else if (incomeRatio >= 1.5) score += 20;
    else score += 10;

    // Mevcut kredi skoru (0-30 puan)
    if (existingCredits === 0) score += 30;
    else if (existingCredits === 1) score += 25;
    else if (existingCredits === 2) score += 15;
    else score += 5;

    // Gelir miktarı skoru (0-30 puan)
    if (monthlyIncome >= 15000) score += 30;
    else if (monthlyIncome >= 10000) score += 25;
    else if (monthlyIncome >= 8000) score += 20;
    else if (monthlyIncome >= 5000) score += 15;
    else score += 10;

    return Math.min(score, 100);
  }
}
