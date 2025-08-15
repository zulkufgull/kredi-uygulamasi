import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserOwnershipGuard } from '../auth/user-ownership.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findById(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  @Get('tc/:tcKimlikNo')
  async findByTcKimlik(@Param('tcKimlikNo') tcKimlikNo: string): Promise<User> {
    // Basit user tablosunda TC kimlik yok, bu yüzden hata döndür
    throw new Error('TC kimlik numarası ile arama desteklenmiyor');
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<User>
  ): Promise<User> {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.delete(id);
  }

  @Put(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.activate(id);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.deactivate(id);
  }

  @Put(':id/verify-email')
  async verifyEmail(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.verifyEmail(id);
  }

  @Put(':id/verify-phone')
  async verifyPhone(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.verifyPhone(id);
  }

  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getDashboard(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getDashboardData(id);
  }

  @Get(':id/credits')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getCredits(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getCredits(id);
  }

  @Get(':id/payments')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getPayments(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getPayments(id);
  }

  @Get(':id/payment-summary')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getPaymentSummary(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getPaymentSummary(id);
  }

  @Get(':id/credit-summary')
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getCreditSummary(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getCreditSummary(id);
  }
}
