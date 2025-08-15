import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Email kontrolü
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kullanılıyor');
    }

    // Şifreyi hash'le
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'createdAt']
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    console.log('🔍 findByEmail called with:', email);
    const user = await this.userRepository.findOne({
      where: { email }
    });
    console.log('👤 findByEmail result:', user ? `User ID: ${user.id}` : 'No user found');
    return user;
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    // Email değişikliği kontrolü
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email }
      });

      if (existingUser) {
        throw new ConflictException('Bu email adresi zaten kullanılıyor');
      }
    }

    // Şifre değişikliği kontrolü
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async activate(id: number): Promise<User> {
    const user = await this.findById(id);
    // Basit user tablosunda isActive yok, bu yüzden sadece kaydet
    return await this.userRepository.save(user);
  }

  async deactivate(id: number): Promise<User> {
    const user = await this.findById(id);
    // Basit user tablosunda isActive yok, bu yüzden sadece kaydet
    return await this.userRepository.save(user);
  }

  async verifyEmail(id: number): Promise<User> {
    const user = await this.findById(id);
    // Basit user tablosunda isEmailVerified yok, bu yüzden sadece kaydet
    return await this.userRepository.save(user);
  }

  async verifyPhone(id: number): Promise<User> {
    const user = await this.findById(id);
    // Basit user tablosunda isPhoneVerified yok, bu yüzden sadece kaydet
    return await this.userRepository.save(user);
  }

  async getDashboardData(id: number) {
    const user = await this.findById(id);
    
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: user.fullName
      }
    };
  }

  async getCredits(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['creditApplications']
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Frontend'in beklediği format: { credits: [...] }
    return {
      credits: user.creditApplications || []
    };
  }

  async getPayments(id: number) {
    // Basit user tablosunda payment ilişkisi yok, boş array döndür
    return [];
  }

  async getPaymentSummary(id: number) {
    // Basit user tablosunda payment ilişkisi yok, varsayılan değerler döndür
    return {
      totalPaid: 0,
      totalPending: 0,
      totalPayments: 0,
      paidCount: 0,
      pendingCount: 0
    };
  }

  async getCreditSummary(id: number) {
    const creditsData = await this.getCredits(id);
    const credits = creditsData.credits;
    
    const totalRequested = credits.reduce((sum, c) => sum + Number(c.requestedAmount), 0);
    const totalApproved = credits
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + Number(c.approvedAmount || 0), 0);

    return {
      totalCredits: credits.length,
      totalAmount: totalApproved, // Frontend'in beklediği alan adı
      totalRequested,
      totalApproved,
      approvedCount: credits.filter(c => c.status === 'approved').length,
      pendingCount: credits.filter(c => c.status === 'pending').length,
      rejectedCount: credits.filter(c => c.status === 'rejected').length
    };
  }
}

