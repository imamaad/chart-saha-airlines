# ---- مرحله نهایی: Nginx سبک برای سرو فایل‌های استاتیک ----
FROM nginx:alpine

# حذف کانفیگ پیش‌فرض و جایگزینی با کانفیگ اختصاصی ما
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# کپی کل پروژه داخل ریشه‌ی وب سرویس Nginx
# توجه: .dockerignore بساز تا فایل‌های اضافی کپی نشن
COPY . /usr/share/nginx/html

# برای دسترسی از میزبان
EXPOSE 80

# اجرای nginx در فورگراند
CMD ["nginx", "-g", "daemon off;"]
