import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CreditTypesService } from './credit-types.service';
import { CreditType } from './credit-type.entity';

@Controller('credit-types')
export class CreditTypesController {
  constructor(private readonly creditTypesService: CreditTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() creditTypeData: Partial<CreditType>): Promise<CreditType> {
    return this.creditTypesService.create(creditTypeData);
  }

  @Get()
  async findAll(): Promise<CreditType[]> {
    return this.creditTypesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CreditType> {
    return this.creditTypesService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreditType>
  ): Promise<CreditType> {
    return this.creditTypesService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.creditTypesService.delete(id);
  }

  @Put(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number): Promise<CreditType> {
    return this.creditTypesService.activate(id);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<CreditType> {
    return this.creditTypesService.deactivate(id);
  }

  @Get('search/by-amount')
  async findByAmountRange(@Query('amount') amount: number): Promise<CreditType[]> {
    return this.creditTypesService.findByAmountRange(amount);
  }
} 