# 📊 نظام CRM لإدارة العملاء الذكي

نظام متكامل لإدارة العملاء والصفقات والمهام مع واجهة عربية احترافية.

## ✨ المميزات

- 🔐 نظام مصادقة آمن (JWT + bcrypt)
- 👥 إدارة العملاء (إضافة، تعديل، حذف، بحث، تصنيف)
- 💰 متابعة الصفقات بمراحلها (Pipeline)
- ✅ نظام مهام وتذكيرات
- 📈 تقارير وتحليلات من بيانات حقيقية
- 🛡️ حماية API بـ Auth Middleware + Rate Limiting
- 🎨 واجهة عربية RTL حديثة وجذابة
- 📱 تصميم متجاوب (Responsive)

## 🚀 التشغيل المحلي

```bash
npm install
npm start
```

ثم افتح: http://localhost:3000

## 🌐 النشر على Railway

1. اذهب إلى [railway.app](https://railway.app)
2. اختر "Deploy from GitHub"
3. اختر هذا المستودع
4. سيتم النشر تلقائياً

## 📋 API Endpoints

| Endpoint | Method | الوصف | Auth |
|----------|--------|-------|------|
| `/api/health` | GET | حالة النظام | ❌ |
| `/api/auth/register` | POST | تسجيل جديد | ❌ |
| `/api/auth/login` | POST | تسجيل دخول | ❌ |
| `/api/customers` | GET/POST | العملاء | ✅ |
| `/api/customers/:id` | GET/PUT/DELETE | عميل محدد | ✅ |
| `/api/deals` | GET/POST | الصفقات | ✅ |
| `/api/deals/pipeline/summary` | GET | ملخص Pipeline | ✅ |
| `/api/tasks` | GET/POST | المهام | ✅ |
| `/api/tasks/overdue` | GET | المهام المتأخرة | ✅ |
| `/api/reports/dashboard` | GET | إحصائيات لوحة التحكم | ✅ |
| `/api/reports/sales` | GET | تقرير المبيعات | ✅ |
| `/api/reports/customers` | GET | تقرير العملاء | ✅ |

## 🔧 التقنيات

- **Backend:** Node.js + Express 5
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT + bcrypt
- **Security:** Helmet + CORS + Rate Limiting
- **Frontend:** HTML + CSS + Vanilla JS
