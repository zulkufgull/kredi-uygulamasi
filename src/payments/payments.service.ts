import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './payment.entity';
import { CreditApplication } from '../credit-applications/credit-application.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(CreditApplication)
    private creditApplicationRepository: Repository<CreditApplication>,
  ) {}

  async createPaymentSchedule(creditApplicationId: number): Promise<Payment[]> {
    console.log(`🔍 DEBUG - Ödeme planı oluşturuluyor: Kredi başvurusu ${creditApplicationId}`);
    
    const creditApplication = await this.creditApplicationRepository.findOne({
      where: { id: creditApplicationId }
    });

    if (!creditApplication) {
      console.log(`❌ Kredi başvurusu bulunamadı: ${creditApplicationId}`);
      throw new NotFoundException('Kredi başvurusu bulunamadı');
    }

    console.log(`   - Kredi durumu: ${creditApplication.status}`);
    console.log(`   - Aylık taksit: ${creditApplication.monthlyPayment}`);
    console.log(`   - Onaylanan tutar: ${creditApplication.approvedAmount}`);
    console.log(`   - Onaylanan vade: ${creditApplication.approvedTerm}`);

    if (creditApplication.status !== 'approved') {
      console.log(`❌ Kredi henüz onaylanmamış: ${creditApplication.status}`);
      throw new BadRequestException('Sadece onaylanmış krediler için ödeme planı oluşturulabilir');
    }

    const payments: Payment[] = [];
    const monthlyPayment = creditApplication.monthlyPayment;
    const totalAmount = creditApplication.approvedAmount;
    const term = creditApplication.approvedTerm;
    const monthlyInterestRate = creditApplication.approvedInterestRate / 100 / 12;

    let remainingBalance = totalAmount;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1); // İlk ödeme bir ay sonra

    console.log(`📊 Ödeme planı hesaplamaları:`);
    console.log(`   - Aylık taksit: ${monthlyPayment} TL`);
    console.log(`   - Toplam tutar: ${totalAmount} TL`);
    console.log(`   - Vade: ${term} ay`);
    console.log(`   - Aylık faiz oranı: ${monthlyInterestRate * 100}%`);
    console.log(`   - Kalan bakiye başlangıç: ${remainingBalance} TL`);

    for (let i = 1; i <= term; i++) {
      const interestAmount = remainingBalance * monthlyInterestRate;
      const principalAmount = monthlyPayment - interestAmount;
      remainingBalance -= principalAmount;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);

      console.log(`   - Taksit ${i} hesaplanıyor:`);
      console.log(`     * Faiz tutarı: ${interestAmount.toFixed(2)} TL`);
      console.log(`     * Ana para: ${principalAmount.toFixed(2)} TL`);
      console.log(`     * Kalan bakiye: ${remainingBalance.toFixed(2)} TL`);

      const payment = this.paymentRepository.create({
        creditApplicationId,
        installmentNumber: i,
        amount: monthlyPayment,
        principalAmount: Math.round(principalAmount * 100) / 100,
        interestAmount: Math.round(interestAmount * 100) / 100,
        remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100),
        dueDate,
        paymentNumber: this.generatePaymentNumber(),
        status: PaymentStatus.PENDING
      });

      payments.push(payment);
      console.log(`   - Taksit ${i}: ${monthlyPayment} TL (${dueDate.toLocaleDateString('tr-TR')})`);
    }

    console.log(`💾 Ödeme planı veritabanına kaydediliyor...`);
    console.log(`   - Kaydedilecek taksit sayısı: ${payments.length}`);
    
    try {
      const savedPayments = await this.paymentRepository.save(payments);
      console.log(`✅ Ödeme planı başarıyla kaydedildi: ${savedPayments.length} taksit`);
      return savedPayments;
    } catch (error) {
      console.error(`❌ Ödeme planı kaydedilemedi: ${error.message}`);
      console.error(`   - Hata detayı:`, error);
      console.error(`   - Stack trace:`, error.stack);
      throw error;
    }
  }

  async makePayment(
    paymentId: number,
    paymentData: {
      paymentMethod: PaymentMethod;
      transactionId?: string;
      notes?: string;
      paymentDetails?: object;
    }
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new NotFoundException('Ödeme bulunamadı');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Bu ödeme zaten yapılmış');
    }

    // Gecikme faizi hesapla
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    const daysLate = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysLate > 0) {
      const dailyLateRate = 0.0005; // Günlük %0.05 gecikme faizi
      payment.lateFee = payment.amount * dailyLateRate * daysLate;
      payment.status = PaymentStatus.LATE;
    } else {
      payment.status = PaymentStatus.PAID;
    }

    payment.paymentMethod = paymentData.paymentMethod;
    if (paymentData.transactionId) {
      payment.transactionId = paymentData.transactionId;
    }
    if (paymentData.notes) {
      payment.notes = paymentData.notes;
    }
    if (paymentData.paymentDetails) {
      payment.paymentDetails = paymentData.paymentDetails;
    }
    payment.paidAt = new Date();

    return this.paymentRepository.save(payment);
  }

  async getPaymentsByCreditApplication(creditApplicationId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { creditApplicationId },
      order: { installmentNumber: 'ASC' }
    });
  }

  async getPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['creditApplication']
    });

    if (!payment) {
      throw new NotFoundException('Ödeme bulunamadı');
    }

    return payment;
  }

  async getPaymentByNumber(paymentNumber: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentNumber },
      relations: ['creditApplication']
    });

    if (!payment) {
      throw new NotFoundException('Ödeme bulunamadı');
    }

    return payment;
  }

  async getPendingPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { status: PaymentStatus.PENDING },
      relations: ['creditApplication'],
      order: { dueDate: 'ASC' }
    });
  }

  async getLatePayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { status: PaymentStatus.LATE },
      relations: ['creditApplication'],
      order: { dueDate: 'ASC' }
    });
  }

  async getDefaultedPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { status: PaymentStatus.DEFAULTED },
      relations: ['creditApplication'],
      order: { dueDate: 'ASC' }
    });
  }

  async updatePaymentStatus(id: number, status: PaymentStatus): Promise<Payment> {
    const payment = await this.getPaymentById(id);
    payment.status = status;
    return this.paymentRepository.save(payment);
  }

  async getPaymentSummary(creditApplicationId: number): Promise<{
    totalPayments: number;
    paidPayments: number;
    pendingPayments: number;
    latePayments: number;
    totalPaid: number;
    totalRemaining: number;
    nextPaymentDue: Date | null;
  }> {
    const payments = await this.getPaymentsByCreditApplication(creditApplicationId);
    
    const totalPayments = payments.length;
    const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID).length;
    const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING).length;
    const latePayments = payments.filter(p => p.status === PaymentStatus.LATE).length;
    
    const totalPaid = payments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount + p.lateFee, 0);
    
    const totalRemaining = payments
      .filter(p => p.status !== PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount, 0);

    const nextPaymentDue = payments
      .filter(p => p.status === PaymentStatus.PENDING)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate || null;

    return {
      totalPayments,
      paidPayments,
      pendingPayments,
      latePayments,
      totalPaid,
      totalRemaining,
      nextPaymentDue
    };
  }

  // User-focused methods
  async getUserPayments(userId: number): Promise<Payment[]> {
    const userCredits = await this.creditApplicationRepository.find({
      where: { userId },
      select: ['id']
    });

    const creditApplicationIds = userCredits.map(credit => credit.id);

    return this.paymentRepository.find({
      where: { creditApplicationId: In(creditApplicationIds) },
      relations: ['creditApplication'],
      order: { dueDate: 'ASC' }
    });
  }

  async getUserPendingPayments(userId: number): Promise<Payment[]> {
    const userCredits = await this.creditApplicationRepository.find({
      where: { userId },
      select: ['id']
    });

    const creditApplicationIds = userCredits.map(credit => credit.id);

    return this.paymentRepository.find({
      where: { 
        creditApplicationId: In(creditApplicationIds),
        status: PaymentStatus.PENDING
      },
      relations: ['creditApplication'],
      order: { dueDate: 'ASC' }
    });
  }

  async getUserLatePayments(userId: number): Promise<Payment[]> {
    const userCredits = await this.creditApplicationRepository.find({
      where: { userId },
      select: ['id']
    });

    const creditApplicationIds = userCredits.map(credit => credit.id);

    return this.paymentRepository.find({
      where: { 
        creditApplicationId: In(creditApplicationIds),
        status: PaymentStatus.LATE
      },
      relations: ['creditApplication'],
      order: { dueDate: 'ASC' }
    });
  }

  async getUserPaymentSummary(userId: number): Promise<{
    totalPayments: number;
    paidPayments: number;
    pendingPayments: number;
    latePayments: number;
    totalPaid: number;
    totalRemaining: number;
    nextPaymentDue: Date | null;
    overdueAmount: number;
  }> {
    const userPayments = await this.getUserPayments(userId);
    
    const totalPayments = userPayments.length;
    const paidPayments = userPayments.filter(p => p.status === PaymentStatus.PAID).length;
    const pendingPayments = userPayments.filter(p => p.status === PaymentStatus.PENDING).length;
    const latePayments = userPayments.filter(p => p.status === PaymentStatus.LATE).length;
    
    const totalPaid = userPayments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
    
    const totalRemaining = userPayments
      .filter(p => p.status !== PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount, 0);

    const overdueAmount = userPayments
      .filter(p => p.status === PaymentStatus.LATE)
      .reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);

    const nextPaymentDue = userPayments
      .filter(p => p.status === PaymentStatus.PENDING)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate || null;

    return {
      totalPayments,
      paidPayments,
      pendingPayments,
      latePayments,
      totalPaid,
      totalRemaining,
      nextPaymentDue,
      overdueAmount
    };
  }

  async makeUserPayment(
    userId: number,
    paymentId: number,
    paymentData: {
      paymentMethod: PaymentMethod;
      transactionId?: string;
      notes?: string;
      paymentDetails?: object;
    }
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['creditApplication']
    });

    if (!payment) {
      throw new NotFoundException('Ödeme bulunamadı');
    }

    // Kullanıcının kendi ödemesi olduğunu doğrula
    if (payment.creditApplication.userId !== userId) {
      throw new BadRequestException('Bu ödeme size ait değil');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Bu ödeme zaten yapılmış');
    }

    return this.makePayment(paymentId, paymentData);
  }

  async getUserCreditPayments(
    userId: number,
    creditApplicationId: number
  ): Promise<Payment[]> {
    // Kullanıcının bu krediye sahip olduğunu doğrula
    const creditApplication = await this.creditApplicationRepository.findOne({
      where: { id: creditApplicationId, userId }
    });

    if (!creditApplication) {
      throw new NotFoundException('Kredi başvurusu bulunamadı veya size ait değil');
    }

    return this.getPaymentsByCreditApplication(creditApplicationId);
  }

  private generatePaymentNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PMT-${timestamp}-${random}`;
  }
} 