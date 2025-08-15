import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    // Admin kontrolü (gelecekte role sistemi eklenebilir)
    // Şimdilik sadece belirli kullanıcı ID'leri admin olarak kabul edelim
    const adminUserIds = [1, 2]; // Admin kullanıcı ID'leri
    
    if (user && adminUserIds.includes(user.userId)) {
      return true;
    }

    throw new ForbiddenException('Bu işlemi gerçekleştirmek için admin yetkisine sahip olmalısınız');
  }
}
