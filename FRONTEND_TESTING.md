# 🧪 Frontend Test Rehberi

## 🎯 **Test Edilecek Özellikler**

### 1. **Giriş ve Kimlik Doğrulama**
- ✅ JWT token ile giriş
- ✅ Token olmadan erişim engelleme
- ✅ Kullanıcı bilgileri doğru yükleme

### 2. **Dashboard Yükleme**
- ✅ Kullanıcı bilgileri görüntüleme
- ✅ Kredi özeti yükleme
- ✅ Ödeme özeti yükleme

### 3. **Kredi Görüntüleme**
- ✅ Onaylanmış krediler listesi
- ✅ Kredi detayları (tutar, vade, taksit)
- ✅ Kredi durumu (✅ Onaylandı)

### 4. **Ödeme Görüntüleme**
- ✅ Tüm ödemeler listesi (36 taksit)
- ✅ Ödeme durumları (pending, paid, late)
- ✅ Vade tarihleri
- ✅ Taksit tutarları

### 5. **Ödeme Yapma**
- ✅ Ödeme modal'ı açma
- ✅ Ödeme yöntemi seçme
- ✅ Ödeme gönderme
- ✅ Durum güncelleme

## 🚀 **Test Senaryoları**

### **Senaryo 1: Dashboard Yükleme**
```bash
1. Browser'da http://localhost:3000/dashboard.html aç
2. Login sayfasına yönlendirilmeli
3. test@test.com / 123456 ile giriş yap
4. Dashboard yüklenmeli
5. Kullanıcı bilgileri görünmeli
```

### **Senaryo 2: Kredi Görüntüleme**
```bash
1. Dashboard'da "Kredilerim" tab'ına tıkla
2. 2 kredi görünmeli:
   - Kredi 1: 10.000 TL / 12 ay
   - Kredi 2: 20.000 TL / 24 ay
3. Her kredi için "Ödemeleri Gör" butonu olmalı
```

### **Senaryo 3: Ödeme Görüntüleme**
```bash
1. Dashboard'da "Ödemelerim" tab'ına tıkla
2. 36 taksit listelenmeli
3. Taksit detayları görünmeli:
   - Taksit No: 1, 2, 3...
   - Vade Tarihi: 15 Eylül 2025, 15 Ekim 2025...
   - Tutar: ₺844.66, ₺849.05
   - Durum: Beklemede, Ödendi
   - İşlemler: Öde butonu
```

### **Senaryo 4: Ödeme Yapma**
```bash
1. "Öde" butonuna tıkla
2. Ödeme modal'ı açılmalı
3. Ödeme yöntemi seç (Banka Transferi)
4. Not ekle: "Test ödemesi"
5. "Ödeme Yap" butonuna tıkla
6. Ödeme durumu "Ödendi" olarak güncellenmeli
```

## 🔧 **Hata Ayıklama**

### **Console Hataları**
```javascript
// Browser Console'da kontrol et:
1. Network tab: API çağrıları
2. Console tab: JavaScript hataları
3. Application tab: LocalStorage
```

### **Yaygın Hatalar**
```javascript
// 1. JWT Token Eksik
Error: Ödemeler yüklenemedi: 401
Çözüm: Token localStorage'da var mı kontrol et

// 2. Status Uyumsuzluğu
Error: payment.status undefined
Çözüm: API'den gelen status alanını kontrol et

// 3. DOM Element Bulunamadı
Error: Cannot read property 'innerHTML' of null
Çözüm: HTML element ID'lerini kontrol et
```

### **API Test Komutları**
```bash
# Ödemeleri listele
curl -H "Authorization: Bearer TOKEN" "http://localhost:3000/payments/user/7"

# Bekleyen ödemeleri listele
curl -H "Authorization: Bearer TOKEN" "http://localhost:3000/payments/user/7/pending"

# Ödeme yap
curl -X POST "http://localhost:3000/payments/user/7/pay/112" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"paymentMethod": "BANK_TRANSFER", "notes": "Test"}'
```

## 📱 **Browser Test**

### **Chrome DevTools**
```bash
1. F12 tuşuna bas
2. Console tab'ını aç
3. Network tab'ını aç
4. Application tab'ını aç
5. LocalStorage'ı kontrol et
```

### **Test Adımları**
```bash
1. Dashboard'ı aç
2. Console'da hata var mı kontrol et
3. Network'te API çağrıları başarılı mı kontrol et
4. Ödemeler tab'ına tıkla
5. Veriler yükleniyor mu kontrol et
6. Hata mesajı var mı kontrol et
```

## 🐛 **Bilinen Sorunlar ve Çözümler**

### **Sorun 1: Ödemeler Yüklenirken Hata**
```javascript
// Hata: Ödemeler yüklenirken hata oluştu
// Çözüm: JWT token header'ı eklendi
headers: {
    'Authorization': `Bearer ${token}`
}
```

### **Sorun 2: Status Uyumsuzluğu**
```javascript
// Hata: payment.status === 'PENDING' çalışmıyor
// Çözüm: Case-insensitive karşılaştırma
payment.status?.toLowerCase() === 'pending'
```

### **Sorun 3: Undefined Değerler**
```javascript
// Hata: Cannot read property 'amount' of undefined
// Çözüm: Optional chaining kullan
payment.amount?.toLocaleString() || 0
```

## ✅ **Test Sonuçları**

### **Başarılı Testler**
- ✅ Dashboard yükleme
- ✅ JWT authentication
- ✅ Kredi görüntüleme
- ✅ Ödeme listesi
- ✅ Ödeme yapma
- ✅ Durum güncelleme

### **Test Edilecek Özellikler**
- 🔄 Ödeme geçmişi
- 🔄 Gecikme takibi
- 🔄 Bildirimler
- 🔄 Raporlama

## 📞 **Destek**

Test sırasında sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Network tab'ında API çağrılarını inceleyin
3. LocalStorage'da token var mı kontrol edin
4. API endpoint'lerini curl ile test edin
5. Backend log'larını kontrol edin
