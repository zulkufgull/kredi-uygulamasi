import { Controller, Get, Post, Put, Param, Body, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { CreditApplicationsService } from './credit-applications.service';
import { CreditApplication, ApplicationStatus } from './credit-application.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserOwnershipGuard } from '../auth/user-ownership.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('credit-applications')
export class CreditApplicationsController {
  constructor(private readonly creditApplicationsService: CreditApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() applicationData: any, @Request() req: any) {
    // JWT'den gelen kullanıcı ID'sini kullan
    applicationData.userId = req.user.userId;
    return this.creditApplicationsService.create(applicationData);
  }

  @Get()
  async findAll() {
    return this.creditApplicationsService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.creditApplicationsService.findByUserId(userId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.creditApplicationsService.findById(id);
  }

  @Get('number/:applicationNumber')
  async findByApplicationNumber(@Param('applicationNumber') applicationNumber: string) {
    return this.creditApplicationsService.findByApplicationNumber(applicationNumber);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async approve(
    @Param('id') id: number,
    @Body() approvalData: { reviewedBy: number; notes?: string }
  ) {
    return this.creditApplicationsService.updateStatus(
      id,
      ApplicationStatus.APPROVED,
      approvalData.reviewedBy,
      approvalData.notes
    );
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async reject(
    @Param('id') id: number,
    @Body() rejectionData: { reviewedBy: number; rejectionReason: string; notes?: string }
  ) {
    return this.creditApplicationsService.updateStatus(
      id,
      ApplicationStatus.REJECTED,
      rejectionData.reviewedBy,
      rejectionData.notes,
      rejectionData.rejectionReason
    );
  }

  @Put(':id/cancel')
  async cancelApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number }
  ) {
    return this.creditApplicationsService.cancelApplication(id, body.userId);
  }

  @Get('status/pending')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getPendingApplications() {
    return this.creditApplicationsService.getPendingApplications();
  }

  @Get('status/approved')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getApprovedApplications() {
    return this.creditApplicationsService.getApprovedApplications();
  }

  @Get('status/:status')
  async getApplicationsByStatus(@Param('status') status: ApplicationStatus) {
    return this.creditApplicationsService.findAll(); // TODO: Filter by status
  }

  @Post(':id/test-auto-approve')
  async testAutoApprove(@Param('id', ParseIntPipe) id: number) {
    return this.creditApplicationsService.testAutoApprove(id);
  }
} 