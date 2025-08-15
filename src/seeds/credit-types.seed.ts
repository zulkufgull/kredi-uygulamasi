import { CreditType } from '../credit-types/credit-type.entity';

export const creditTypesSeed: Partial<CreditType>[] = [
  {
    name: 'İhtiyaç Kredisi',
    description: 'Günlük ihtiyaçlar için kısa vadeli kredi',
    interestRate: 2.5, // %2.5 aylık
    minAmount: 1000,
    maxAmount: 50000,
    minTerm: 3,
    maxTerm: 36,
    commissionRate: 0,
    isActive: true,
    requirements: {
      minimumAge: 18,
      minimumIncome: 3000,
      minimumWorkExperience: 6,
      requiredDocuments: ['Kimlik', 'Maaş bordrosu', 'Adres belgesi']
    }
  },
  {
    name: 'Konut Kredisi',
    description: 'Ev alımı için uzun vadeli kredi',
    interestRate: 1.8, // %1.8 aylık
    minAmount: 50000,
    maxAmount: 2000000,
    minTerm: 12,
    maxTerm: 120,
    commissionRate: 1.5,
    isActive: true,
    requirements: {
      minimumAge: 21,
      minimumIncome: 8000,
      minimumWorkExperience: 12,
      requiredDocuments: ['Kimlik', 'Maaş bordrosu', 'Adres belgesi', 'Tapu', 'Emlak değerleme raporu']
    }
  },
  {
    name: 'Taşıt Kredisi',
    description: 'Araç alımı için orta vadeli kredi',
    interestRate: 2.2, // %2.2 aylık
    minAmount: 10000,
    maxAmount: 500000,
    minTerm: 6,
    maxTerm: 60,
    commissionRate: 1.0,
    isActive: true,
    requirements: {
      minimumAge: 18,
      minimumIncome: 5000,
      minimumWorkExperience: 6,
      requiredDocuments: ['Kimlik', 'Maaş bordrosu', 'Adres belgesi', 'Araç ruhsatı']
    }
  },
  {
    name: 'Ticari Kredi',
    description: 'İşletme ihtiyaçları için kredi',
    interestRate: 3.0, // %3.0 aylık
    minAmount: 25000,
    maxAmount: 1000000,
    minTerm: 6,
    maxTerm: 48,
    commissionRate: 2.0,
    isActive: true,
    requirements: {
      minimumAge: 21,
      minimumIncome: 10000,
      minimumWorkExperience: 24,
      requiredDocuments: ['Kimlik', 'Maaş bordrosu', 'Adres belgesi', 'Vergi levhası', 'İş planı']
    }
  }
]; 