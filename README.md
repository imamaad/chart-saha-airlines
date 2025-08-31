# چارت سازمانی داینامیک - نسخه React

این پروژه یک چارت سازمانی داینامیک و تعاملی است که با React و Vite ساخته شده است.

## ویژگی‌ها

- **React + Vite**: استفاده از آخرین تکنولوژی‌های React
- **D3.js**: برای رندر کردن چارت‌های تعاملی
- **Tailwind CSS**: برای استایل‌دهی مدرن و responsive
- **RTL Support**: پشتیبانی کامل از راست به چپ
- **فونت Vazirmatn**: فونت فارسی زیبا و خوانا
- **Dark Mode**: پشتیبانی از حالت تاریک
- **Responsive Design**: سازگار با تمام دستگاه‌ها
- **TypeScript Ready**: آماده برای استفاده از TypeScript

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js (نسخه 18 یا بالاتر)
- npm یا yarn

### نصب dependencies
```bash
npm install
```

### اجرای برنامه در حالت development
```bash
npm run dev
```

### ساخت برنامه برای production
```bash
npm run build
```

### پیش‌نمایش برنامه production
```bash
npm run preview
```

## ساختار پروژه

```
src/
├── components/          # کامپوننت‌های React
│   ├── App.jsx         # کامپوننت اصلی
│   ├── Header.jsx      # هدر برنامه
│   ├── Breadcrumb.jsx  # ناوبری breadcrumb
│   ├── ChartRenderer.jsx # رندر چارت D3
│   ├── ListRenderer.jsx  # رندر لیست
│   ├── DataManager.js  # مدیریت داده‌ها
│   └── ErrorHandler.jsx # مدیریت خطاها
├── index.css           # استایل‌های اصلی
└── main.jsx           # نقطه ورود برنامه
```

## کامپوننت‌ها

### App.jsx
کامپوننت اصلی که تمام کامپوننت‌های دیگر را هماهنگ می‌کند.

### ChartRenderer.jsx
کامپوننت مسئول رندر کردن چارت سازمانی با استفاده از D3.js.

### ListRenderer.jsx
کامپوننت مسئول نمایش لیست سازمانی با قابلیت‌های:
- نمایش تمام فیلدهای موجود
- محاسبه آمار
- ردیف مجموع

### DataManager.js
کلاس مسئول مدیریت داده‌ها شامل:
- بارگذاری داده‌ها از JSON
- تولید ID برای گره‌ها
- مدیریت children
- محاسبه آمار

### ErrorHandler.jsx
سیستم مدیریت خطاها با قابلیت‌های:
- نمایش خطاها
- ثبت خطاها
- مدیریت listeners

## استایل‌دهی

پروژه از Tailwind CSS استفاده می‌کند و شامل:
- متغیرهای CSS سفارشی
- پشتیبانی از RTL
- فونت Vazirmatn
- رنگ‌بندی مناسب برای فارسی

## داده‌ها

فایل `public/data.json` شامل ساختار سازمانی است که شامل:
- `rawInitial`: گره‌های اولیه
- `childrenDB`: پایگاه داده children

## اسکریپت‌ها

- `npm run dev`: اجرای برنامه در حالت development
- `npm run build`: ساخت برنامه برای production
- `npm run preview`: پیش‌نمایش برنامه production
- `npm run lint`: بررسی کد با ESLint

## تکنولوژی‌ها

- **React 18**: کتابخانه UI
- **Vite**: ابزار build و development server
- **D3.js**: کتابخانه visualization
- **Tailwind CSS**: فریمورک CSS
- **ESLint**: ابزار linting

## مرورگرهای پشتیبانی شده

- Chrome (آخرین نسخه)
- Firefox (آخرین نسخه)
- Safari (آخرین نسخه)
- Edge (آخرین نسخه)

## مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. Branch جدید ایجاد کنید
3. تغییرات خود را commit کنید
4. Pull request ارسال کنید

## لایسنس

MIT License