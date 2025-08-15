# Kredi Uygulaması

NestJS ile geliştirilmiş modern bir kredi başvuru ve hesaplama sistemi.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: Kayıt, profil yönetimi, doğrulama
- **Authentication Sistemi**: JWT token tabanlı güvenli giriş
- **Kredi Türleri**: İhtiyaç, konut, taşıt, ticari krediler
- **Kredi Hesaplama**: Detaylı taksit planı ve uygunluk kontrolü
- **Başvuru Takibi**: Başvuru durumu ve geçmiş
- **Admin Paneli**: Başvuruları yönetme ve onaylama

## 📋 Gereksinimler

- Node.js (v18+)
- MySQL (v8.0+)
- npm veya yarn

## 🛠️ Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd kredi-uygulamasi
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **MySQL veritabanını hazırlayın**
```sql
CREATE DATABASE credit_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Environment variables dosyası oluşturun**
Proje ana dizininde `.env` dosyası oluşturun:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=credit_app
NODE_ENV=development
```

**Not**: Eğer `.env` dosyası oluşturamıyorsanız, `src/app.module.ts` dosyasındaki varsayılan değerleri güncelleyin.

5. **Uygulamayı başlatın**
```bash
npm run start:dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📚 API Dokümantasyonu

### Authentication İşlemleri

#### Kullanıcı Girişi
```http
POST /auth/login
Content-Type: application/json

{
  "email": "ahmet.yilmaz@example.com",
  "password": "password123"
}
```

#### Kullanıcı Kaydı
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet@example.com",
  "password": "güvenli123",
  "phoneNumber": "05551234567",
  "tcKimlikNo": "12345678901",
  "birthDate": "1990-01-01",
  "address": "Atatürk Cad. No:1",
  "city": "İstanbul",
  "district": "Kadıköy",
  "postalCode": "34700",
  "monthlyIncome": 8000,
  "employerName": "ABC Şirketi",
  "jobTitle": "Mühendis",
  "workExperience": 24
}
```

#### Kullanıcı Profili (JWT Token gerekli)
```http
GET /auth/profile
Authorization: Bearer <JWT_TOKEN>
```

### Kullanıcı İşlemleri

#### Kullanıcı Kaydı
```http
POST /users
Content-Type: application/json

{
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet@example.com",
  "password": "güvenli123",
  "phoneNumber": "05551234567",
  "tcKimlikNo": "12345678901",
  "birthDate": "1990-01-01",
  "address": "Atatürk Cad. No:1",
  "city": "İstanbul",
  "district": "Kadıköy",
  "postalCode": "34700",
  "monthlyIncome": 8000,
  "employerName": "ABC Şirketi",
  "jobTitle": "Mühendis",
  "workExperience": 24
}
```

#### Kullanıcı Listesi
```http
GET /users
```

#### Kullanıcı Detayı
```http
GET /users/:id
```

### Kredi Türleri

#### Kredi Türü Listesi
```http
GET /credit-types
```

#### Tutara Göre Kredi Türleri
```http
GET /credit-types/search/by-amount?amount=25000
```



#### Kredi Hesaplama
```http
POST /credit-calculations/calculate
Content-Type: application/json

{
  "amount": 25000,
  "term": 12,
  "creditTypeId": 1,
  "monthlyIncome": 8000,
  "userId": 1
}
```

#### Hesaplama Geçmişi
```http
GET /credit-calculations/history/:userId
```

## 🗄️ Veritabanı Yapısı

### Users Tablosu
- Kullanıcı bilgileri
- Doğrulama durumları
- İş ve gelir bilgileri

### CreditTypes Tablosu
- Kredi türleri
- Faiz oranları
- Limit ve vade bilgileri

### CreditApplications Tablosu
- Kredi başvuruları
- Başvuru durumları
- Onay bilgileri

### CreditCalculations Tablosu
- Hesaplama geçmişi
- Taksit planları
- Uygunluk kontrolleri

## 🔧 Geliştirme

### Test Verileri
Uygulama başlatıldığında otomatik olarak test verileri yüklenir:
- 4 farklı kredi türü
- Gerçekçi faiz oranları ve limitler

### Ortam Değişkenleri
`.env` dosyası oluşturarak yapılandırma yapabilirsiniz:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=credit_app
PORT=3000
```

## 🚀 Production

Production ortamında:
1. `synchronize: false` yapın
2. Migration'ları kullanın
3. Environment variables kullanın
4. Logging'i yapılandırın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.
