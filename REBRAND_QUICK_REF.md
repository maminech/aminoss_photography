# ⚡ INNOV8 REBRAND - QUICK REFERENCE

## 🎯 What Changed At-A-Glance

| Item | Old (Aminoss) | New (Innov8) |
|------|--------------|--------------|
| **Brand Name** | Aminoss Photography | Innov8 Production |
| **Instagram** | @aminoss.photography | @innov8.tn |
| **Email** | aminoss.photography@gmail.com | contact@innov8.tn |
| **Cloudinary Preset** | aminoss_portfolio | innov8_portfolio |
| **Service Worker Cache** | aminoss-admin-v3 | innov8-admin-v3 |
| **Flutter Package** | com.aminoss.photography | com.innov8.production |
| **Flutter Project** | aminoss_photography | innov8_production |
| **Notification Channel** | aminoss_channel | innov8_channel |

---

## 🚨 CRITICAL: Before You Deploy

### 1. Cloudinary Preset
```
✅ Create preset: innov8_portfolio
✅ Set to: Unsigned
✅ Folder: innov8_production
```

### 2. Email
```
✅ Setup: contact@innov8.tn
✅ Update Vercel: EMAIL_USER="contact@innov8.tn"
```

### 3. Instagram
```
✅ Verify: @innov8.tn exists
✅ Test: All links work
```

---

## 📝 Deploy Commands

```powershell
# Build
npm run build

# Test locally
npm run dev

# Deploy
git add .
git commit -m "Complete rebrand: Aminoss → Innov8"
git push origin main
```

---

## 🎉 Status

- **Files Updated:** 400+
- **Source Code:** ✅ 0 "aminoss" references
- **Ready to Deploy:** ✅ YES (after Cloudinary preset)

---

## 📚 Full Documentation

- **REBRAND_COMPLETE.md** - Complete details
- **POST_REBRAND_ACTIONS.md** - Action checklist
