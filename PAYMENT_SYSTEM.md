# 💳 Kredi Uygulaması Ödeme Sistemi

## 🎯 **Sistem Nasıl Çalışıyor?**

### 1. **Otomatik Kredi Onayı**
- Kullanıcı kredi başvurusu yapar
- Sistem gelir/taksit oranını hesaplar
- Gelir > Taksit × 1.2 ise **otomatik onay**
- Gelir yetersizse **manuel inceleme** gerekli

### 2. **Otomatik Ödeme Planı Oluşturma**
- Kredi onaylandığında otomatik ödeme planı oluşturulur
- Her ay için ayrı taksit planlanır
- Ana para + faiz hesaplanır
- Vade tarihleri belirlenir

### 3. **Ödeme Takibi**
- Tüm taksitler "pending" (beklemede) durumunda
- Kullanıcılar ödemelerini görebilir
- Ödeme yapıldığında durum güncellenir

## 🔧 **Teknik Detaylar**

### **Kredi Onay Kriterleri:**
```typescript
// Basit kriter: Aylık gelir > Aylık taksit × 1.2
const minimumIncome = monthlyPayment * 1.2;
const isIncomeSufficient = monthlyIncome >= minimumIncome;
return isIncomeSufficient;
```

### **Aylık Taksit Hesaplama:**
```typescript
// Standart kredi taksit formülü
const monthlyInterestRate = annualInterestRate / 100 / 12;
const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) / 
                      (Math.pow(1 + monthlyInterestRate, term) - 1);
```

### **Ödeme Planı Oluşturma:**
```typescript
// Her taksit için:
- Taksit numarası
- Vade tarihi
- Taksit tutarı
- Ana para miktarı
- Faiz miktarı
- Kalan bakiye
```

## 📊 **Örnek Kredi Hesaplaması**

### **Test Kullanıcısı (ID: 7)**
- **Aylık Gelir**: 5.000 TL
- **Kredi 1**: 10.000 TL / 12 ay / %2.50
- **Kredi 2**: 20.000 TL / 24 ay / %1.80

### **Kredi 1 Detayları:**
- **Aylık Taksit**: 844.66 TL
- **Toplam Ödeme**: 10.135.92 TL
- **Toplam Faiz**: 1.135.92 TL
- **Gelir/Taksit Oranı**: 5.92 (çok güvenli!)

### **Kredi 2 Detayları:**
- **Aylık Taksit**: 849.05 TL
- **Toplam Ödeme**: 20.377.20 TL
- **Toplam Faiz**: 377.20 TL
- **Gelir/Taksit Oranı**: 5.89 (çok güvenli!)

## 🚀 **Otomatik İşlemler**

### **1. Kredi Başvurusu → Otomatik Onay**
```bash
POST /credit-applications
→ Sistem gelir kontrolü yapar
→ Onay kriterleri karşılanıyorsa otomatik onay
→ Status: "approved" olur
```

### **2. Onay → Ödeme Planı**
```bash
# Kredi onaylandığında otomatik olarak:
→ 12 ay için 12 taksit oluşturulur
→ Her taksit için vade tarihi belirlenir
→ Ana para + faiz hesaplanır
→ Kalan bakiye güncellenir
```

### **3. Ödeme Planı → Kullanıcı Görünümü**
```bash
GET /payments/user/7
→ Tüm taksitler listelenir
→ Vade tarihleri gösterilir
→ Kalan bakiye takip edilir
```

## 📱 **Frontend Entegrasyonu**

### **Dashboard'da Görünen Bilgiler:**
- **Toplam Kredi**: 2 adet
- **Toplam Tutar**: 30.000 TL
- **Bekleyen Ödemeler**: 36 taksit
- **Sonraki Vade**: 15 Eylül 2025

### **Kredi Kartları:**
- Kredi türü ve tutarı
- Onay durumu (✅ Onaylandı)
- Aylık taksit bilgisi
- Ödemeleri gör butonu

### **Ödeme Tablosu:**
- Taksit numarası
- Vade tarihi
- Taksit tutarı
- Ödeme durumu
- Kalan bakiye

## 🔒 **Güvenlik Özellikleri**

### **JWT Authentication:**
- Tüm endpoint'ler JWT token ile korunuyor
- Token olmadan hiçbir veriye erişim yok

### **User Ownership:**
- Kullanıcılar sadece kendi verilerini görebiliyor
- Başka kullanıcı ID'leri ile erişim engellendi

### **Admin Yetkileri:**
- Sadece admin kullanıcılar kredi onay/red yapabiliyor
- Normal kullanıcılar admin işlemleri yapamıyor

## 🧪 **Test Senaryoları**

### **1. Başarılı Kredi Başvurusu:**
```bash
# Test kullanıcısı ile kredi başvurusu
POST /credit-applications
→ Otomatik onay ✅
→ Ödeme planı oluşturuldu ✅
→ Dashboard'da görünüyor ✅
```

### **2. Güvenlik Testi:**
```bash
# Başka kullanıcı verilerine erişim
GET /users/8 (JWT token ile)
→ 403 Forbidden ✅
→ Güvenlik çalışıyor ✅
```

### **3. Ödeme Görünümü:**
```bash
# Kullanıcının kendi ödemeleri
GET /payments/user/7 (JWT token ile)
→ 36 taksit listeleniyor ✅
→ Tüm detaylar görünüyor ✅
```

## 🔮 **Gelecek Geliştirmeler**

1. **Otomatik Ödeme Sistemi**
   - Banka hesabından otomatik çekim
   - SMS/Email bildirimleri

2. **Gecikme Takibi**
   - Vadesi geçen ödemeler için uyarı
   - Gecikme faizi hesaplama

3. **Ödeme Yöntemleri**
   - Kredi kartı ile ödeme
   - Banka transferi
   - Mobil ödeme

4. **Raporlama**
   - Aylık ödeme raporları
   - Kredi performans analizi
   - Risk değerlendirmesi

## 📞 **Destek**

Sistem ile ilgili sorunlar için:
- Backend log'larını kontrol edin
- JWT token'ın geçerli olduğundan emin olun
- Kullanıcı ID'lerinin doğru olduğunu kontrol edin
