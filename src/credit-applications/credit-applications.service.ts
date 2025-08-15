import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditApplication, ApplicationStatus } from './credit-application.entity';
import { CreditApprovalService } from './credit-approval.service';
import { CreditType } from '../credit-types/credit-type.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class CreditApplicationsService {
  constructor(
    @InjectRepository(CreditApplication)
    private creditApplicationRepository: Repository<CreditApplication>,
    @InjectRepository(CreditType)
    private creditTypeRepository: Repository<CreditType>,
    private creditApprovalService: CreditApprovalService,
    private paymentsService: PaymentsService,
  ) {}

  async create(createCreditApplicationDto: any): Promise<CreditApplication> {
    const application = this.creditApplicationRepository.create({
      ...createCreditApplicationDto,
      applicationNumber: this.generateApplicationNumber(),
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.creditApplicationRepository.save(application);
    let app: CreditApplication;
    
    if (Array.isArray(savedApplication)) {
      app = savedApplication[0];
    } else {
      app = savedApplication;
    }

    // Otomatik onay sistemi çalıştır
    try {
      const approvalResult = await this.creditApprovalService.autoApproveCredit(app.id);
      
      // Onay sonucunu logla
      console.log(`🎯 Kredi başvurusu ${app.id}: ${approvalResult.reason}`);
      console.log(`💰 Aylık taksit: ${approvalResult.monthlyPayment} TL`);
      console.log(`📊 Gelir/Taksit oranı: ${approvalResult.incomeRatio.toFixed(2)}`);
      console.log(`✅ Otomatik onay: ${approvalResult.approved ? 'BAŞARILI' : 'MANUEL İNCELEME'}`);
      
    } catch (error) {
      console.error('❌ Otomatik onay hatası:', error);
      // Hata durumunda başvuru beklemeye alınır
    }

    return app;
  }

  async findAll(): Promise<CreditApplication[]> {
    return this.creditApplicationRepository.find({
      relations: ['user', 'creditType'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByUserId(userId: number): Promise<CreditApplication[]> {
    return this.creditApplicationRepository.find({
      where: { userId },
      relations: ['creditType'],
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: number): Promise<CreditApplication> {
    const application = await this.creditApplicationRepository.findOne({
      where: { id },
      relations: ['user', 'creditType']
    });

    if (!application) {
      throw new NotFoundException('Kredi başvurusu bulunamadı');
    }

    return application;
  }

  async findByApplicationNumber(applicationNumber: string): Promise<CreditApplication> {
    const application = await this.creditApplicationRepository.findOne({
      where: { applicationNumber },
      relations: ['user', 'creditType']
    });

    if (!application) {
      throw new NotFoundException('Kredi başvurusu bulunamadı');
    }

    return application;
  }

  async updateStatus(
    id: number, 
    status: ApplicationStatus, 
    reviewedBy: number,
    notes?: string,
    rejectionReason?: string
  ): Promise<CreditApplication> {
    const application = await this.findById(id);

    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = reviewedBy;
    if (notes) {
      application.notes = notes;
    }

    if (status === ApplicationStatus.REJECTED && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    // Eğer onaylandıysa, kredi hesaplama yap ve ödeme planı oluştur
    if (status === ApplicationStatus.APPROVED) {
      const creditType = await this.creditTypeRepository.findOne({
        where: { id: application.creditTypeId }
      });

      if (!creditType) {
        throw new NotFoundException('Kredi türü bulunamadı');
      }

      const monthlyInterestRate = creditType.interestRate / 100 / 12;
      const monthlyPayment = this.calculateMonthlyPayment(
        application.requestedAmount, 
        monthlyInterestRate, 
        application.requestedTerm
      );

      application.approvedAmount = application.requestedAmount;
      application.approvedTerm = application.requestedTerm;
      application.approvedInterestRate = creditType.interestRate;
      application.monthlyPayment = monthlyPayment;
      application.totalPayment = monthlyPayment * application.requestedTerm;

      // Önce kredi başvurusunu kaydet
      const savedApplication = await this.creditApplicationRepository.save(application);
      let app: CreditApplication;
      
      if (Array.isArray(savedApplication)) {
        app = savedApplication[0];
      } else {
        app = savedApplication;
      }

      // Sonra ödeme planı oluştur
      await this.paymentsService.createPaymentSchedule(app.id);
      return app;
    }

    const savedApp = await this.creditApplicationRepository.save(application);
    if (Array.isArray(savedApp)) {
      return savedApp[0];
    }
    return savedApp;
  }

  async approveApplication(id: number, reviewedBy: number, notes?: string): Promise<CreditApplication> {
    return this.updateStatus(id, ApplicationStatus.APPROVED, reviewedBy, notes);
  }

  async rejectApplication(id: number, reviewedBy: number, rejectionReason: string, notes?: string): Promise<CreditApplication> {
    return this.updateStatus(id, ApplicationStatus.REJECTED, reviewedBy, notes, rejectionReason);
  }

  async cancelApplication(id: number, userId: number): Promise<CreditApplication> {
    const application = await this.findById(id);
    
    if (application.userId !== userId) {
      throw new BadRequestException('Bu başvuruyu iptal etme yetkiniz yok');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Sadece bekleyen başvurular iptal edilebilir');
    }

    return this.updateStatus(id, ApplicationStatus.CANCELLED, userId);
  }

  private generateApplicationNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `KR-${timestamp}-${random}`;
  }

  private calculateMonthlyPayment(principal: number, monthlyRate: number, term: number): number {
    if (monthlyRate === 0) {
      return principal / term;
    }
    
    const rate = monthlyRate;
    const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return Math.round(payment * 100) / 100;
  }

  async getPendingApplications(): Promise<CreditApplication[]> {
    return this.creditApplicationRepository.find({
      where: { status: ApplicationStatus.PENDING },
      relations: ['user', 'creditType'],
      order: { createdAt: 'ASC' }
    });
  }

  async getApprovedApplications(): Promise<CreditApplication[]> {
    return this.creditApplicationRepository.find({
      where: { status: ApplicationStatus.APPROVED },
      relations: ['user', 'creditType'],
      order: { createdAt: 'DESC' }
    });
  }

  async testAutoApprove(id: number): Promise<any> {
    try {
      const result = await this.creditApprovalService.autoApproveCredit(id);
      return {
        success: true,
        result,
        message: 'Otomatik onay test edildi'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Otomatik onay test edilemedi'
      };
    }
  }
} 