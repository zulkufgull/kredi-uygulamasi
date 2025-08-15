import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditType } from './credit-type.entity';

@Injectable()
export class CreditTypesService {
  constructor(
    @InjectRepository(CreditType)
    private creditTypeRepository: Repository<CreditType>,
  ) {}

  async create(creditTypeData: Partial<CreditType>): Promise<CreditType> {
    const creditType = this.creditTypeRepository.create(creditTypeData);
    return this.creditTypeRepository.save(creditType);
  }

  async findAll(): Promise<CreditType[]> {
    return this.creditTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findById(id: number): Promise<CreditType> {
    const creditType = await this.creditTypeRepository.findOne({
      where: { id }
    });

    if (!creditType) {
      throw new NotFoundException('Kredi türü bulunamadı');
    }

    return creditType;
  }

  async update(id: number, updateData: Partial<CreditType>): Promise<CreditType> {
    const creditType = await this.findById(id);
    Object.assign(creditType, updateData);
    return this.creditTypeRepository.save(creditType);
  }

  async delete(id: number): Promise<void> {
    const creditType = await this.findById(id);
    await this.creditTypeRepository.remove(creditType);
  }

  async activate(id: number): Promise<CreditType> {
    const creditType = await this.findById(id);
    creditType.isActive = true;
    return this.creditTypeRepository.save(creditType);
  }

  async deactivate(id: number): Promise<CreditType> {
    const creditType = await this.findById(id);
    creditType.isActive = false;
    return this.creditTypeRepository.save(creditType);
  }

  async findByAmountRange(amount: number): Promise<CreditType[]> {
    return this.creditTypeRepository
      .createQueryBuilder('creditType')
      .where('creditType.isActive = :isActive', { isActive: true })
      .andWhere('creditType.minAmount <= :amount', { amount })
      .andWhere('creditType.maxAmount >= :amount', { amount })
      .orderBy('creditType.interestRate', 'ASC')
      .getMany();
  }
} 