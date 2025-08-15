# 🔒 Kredi Uygulaması Güvenlik Dokümantasyonu

## 🛡️ Güvenlik Özellikleri

### 1. **JWT Authentication (JSON Web Token)**
- Tüm kullanıcı endpoint'leri JWT token ile korunuyor
- Token olmadan hiçbir veriye erişim yok
- Token'lar expire oluyor ve yenilenmeli

### 2. **User Ownership Guard**
- Kullanıcılar **SADECE** kendi verilerine erişebilir
- Başka kullanıcı ID'leri ile veri çekme engellendi
- URL'de kullanıcı ID'si olsa bile erişim yok

### 3. **Admin Guard**
- Sadece admin kullanıcılar kredi onay/red yapabilir
- Admin kullanıcı ID'leri: `[1, 2]`
- Normal kullanıcılar admin işlemleri yapamaz

### 4. **Endpoint Güvenliği**

#### 🔐 Korumalı Endpoint'ler:
- `GET /users/:id` - Sadece kendi verisi
- `GET /users/:id/dashboard` - Sadece kendi dashboard'u
- `GET /users/:id/credits` - Sadece kendi kredileri
- `GET /users/:id/payments` - Sadece kendi ödemeleri
- `GET /credit-applications/user/:userId` - Sadece kendi başvuruları
- `GET /payments/user/:userId/*` - Sadece kendi ödemeleri

#### 👑 Admin Endpoint'leri:
- `PUT /credit-applications/:id/approve` - Kredi onaylama
- `PUT /credit-applications/:id/reject` - Kredi reddetme
- `GET /credit-applications/status/pending` - Bekleyen başvurular
- `GET /credit-applications/status/approved` - Onaylanan başvurular

#### 📝 Kullanıcı Endpoint'leri:
- `POST /credit-applications` - Kredi başvurusu (otomatik kullanıcı ID)
- `POST /users` - Kullanıcı oluşturma

## 🚫 Güvenlik Açıkları Kapatıldı

### ❌ Önceki Durum:
- Kullanıcılar başka kullanıcı ID'leri ile veri çekebiliyordu
- JWT token kontrolü yoktu
- Admin yetkisi kontrolü yoktu

### ✅ Şimdiki Durum:
- Her endpoint JWT ile korunuyor
- Kullanıcılar sadece kendi verilerine erişebiliyor
- Admin işlemleri sadece admin kullanıcılar yapabiliyor

## 🔑 Kullanım Örnekleri

### Kullanıcı Girişi:
```bash
# Login endpoint'inden JWT token al
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Kullanıcı Verilerine Erişim:
```bash
# JWT token ile kendi verilerine eriş
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/users/7"
```

### Admin İşlemleri:
```bash
# Admin kullanıcı ile kredi onaylama
curl -X PUT "http://localhost:3000/credit-applications/15/approve" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reviewedBy": 1, "notes": "Onaylandı"}'
```

## 🚨 Güvenlik Testleri

### ✅ Başarısız Erişim Denemeleri:
```bash
# Token olmadan erişim
curl "http://localhost:3000/users/7"
# Response: {"message":"Unauthorized","statusCode":401}

# Başka kullanıcı verilerine erişim
curl -H "Authorization: Bearer USER_TOKEN" "http://localhost:3000/users/8"
# Response: {"message":"Bu işlemi gerçekleştirmek için yetkiniz yok","statusCode":403}

# Normal kullanıcı ile admin işlemi
curl -X PUT "http://localhost:3000/credit-applications/15/approve" \
  -H "Authorization: Bearer USER_TOKEN"
# Response: {"message":"Bu işlemi gerçekleştirmek için admin yetkisine sahip olmalısınız","statusCode":403}
```

## 🔮 Gelecek Geliştirmeler

1. **Role-Based Access Control (RBAC)**
2. **API Rate Limiting**
3. **Request Logging ve Audit Trail**
4. **Data Encryption**
5. **Two-Factor Authentication (2FA)**

## 📞 Güvenlik Sorunları

Güvenlik ile ilgili herhangi bir sorun tespit ederseniz:
- Hemen bildirin
- Detaylı açıklama yapın
- Öncelik seviyesi belirtin
