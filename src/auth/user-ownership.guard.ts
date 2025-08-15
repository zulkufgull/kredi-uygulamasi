import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class UserOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any; // JWT'den gelen kullanıcı bilgisi
    const requestedUserId = parseInt(request.params.userId || request.params.id);

    // Kullanıcı kendi ID'sine erişmeye çalışıyor mu?
    if (user && user.userId === requestedUserId) {
      return true;
    }

    // Admin kontrolü (opsiyonel - gelecekte eklenebilir)
    // if (user && user.role === 'admin') {
    //   return true;
    // }

    throw new ForbiddenException('Bu işlemi gerçekleştirmek için yetkiniz yok');
  }
}
