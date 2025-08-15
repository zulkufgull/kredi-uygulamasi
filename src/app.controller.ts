import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SeedsService } from './seeds/seeds.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seedsService: SeedsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('seed')
  async seed() {
    await this.seedsService.seed();
    return { message: 'Seed işlemi başarıyla tamamlandı!' };
  }
}
