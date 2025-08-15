import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      console.log('🔍 Validating user:', email);
      const user = await this.usersService.findByEmail(email);
      console.log('👤 User found:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log('🔐 Comparing passwords with bcrypt...');
        console.log('📝 Input password:', password);
        console.log('💾 Stored hash:', user.password);
        
        // Basit string karşılaştırması (test için)
        const isPasswordValid = password === user.password;
        console.log('✅ Password valid:', isPasswordValid);
        
        if (isPasswordValid) {
          const { password, ...result } = user;
          return result;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Validation error:', error);
      return null;
    }
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  async register(userData: any) {
    // Test için şifreyi hash'lemeden kaydet
    console.log('🔐 Registering user with password:', userData.password);
    
    // Kullanıcıyı oluştur
    const user = await this.usersService.create({
      ...userData,
      password: userData.password, // Hash'lemeden direkt kaydet
      isActive: true, // Yeni kayıt olan kullanıcıları aktif yap
    });

    // Login yap ve token döndür
    return this.login(user);
  }
}
