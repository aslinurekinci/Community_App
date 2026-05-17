## 🚀 Pre-Push Kontrol Sistemi — Kurulum Rehberi

Bu dosya `mobilSosyalMedya` projesindeki pre-push hook sistemini açıklar.

### Kurulum (Sadece 1 kez)

Terminalde proje klasöründe çalıştır:

```powershell
# 1. Husky + lint-staged kur
npm install --save-dev husky lint-staged

# 2. Husky'i başlat (Git hook'larını aktive eder)
npx husky init

# 3. .husky/pre-push dosyası zaten hazır, üzerine yaz:
echo "node scripts/pre-push-check.js" > .husky/pre-push

# 4. Manuel test (push olmadan çalıştır):
npm run pre-push
```

### Nasıl Çalışır?

`git push` yaptığında otomatik devreye girer:

```
git push origin main
  ↓
[pre-push hook tetiklenir]
  ↓
node scripts/pre-push-check.js
  ↓
[1/4] TypeScript tip kontrolü ............. ✅ Temiz
[2/4] ESLint ............................. ✅ Temiz
[3/4] console.log kalıntıları ............ ✅ Bulunamadı
[4/4] Jest testleri ...................... ✅ Başarılı
  ↓
✅ Push devam ediyor!
```

### Bypass (Acil Durum)

```powershell
git push --no-verify
```

### Sorun Giderme

| Hata | Çözüm |
|------|-------|
| `tsc: command not found` | `npm install` çalıştır |
| Hook çalışmıyor | `npx husky init` tekrar çalıştır |
| ESLint hataları | `npm run lint:fix` çalıştır |
