import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Static dosyaları serve et
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // CORS ayarları
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(3000);
  console.log('Uygulama http://localhost:3000 adresinde çalışıyor');
}
bootstrap();
