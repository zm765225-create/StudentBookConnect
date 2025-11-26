# نظام إدارة الكتب - كلية التربية النوعية

## نظرة عامة
تطبيق موبايل عربي RTL لإدارة مبيعات الكتب وتسليم الأبحاث لقسم الاقتصاد المنزلي بكلية التربية النوعية - جامعة عين شمس.

## المميزات الرئيسية

### بوابة الطالب (بدون تسجيل دخول)
- تسجيل البيانات الشخصية (الاسم، السكشن، الهاتف)
- اختيار الكتب والمنتجات
- متابعة حالة الطلب والدفع والتسليم
- تسليم الأبحاث المطلوبة
- إرسال ملاحظات للمسؤول

### لوحة تحكم المسؤول (كلمة المرور: 107110)
- إدارة أكثر من 700 طالب
- إضافة طلاب فردياً أو بالجملة (من نص منسوخ)
- إدارة المنتجات والمخزون
- متابعة الخزينة والإيرادات
- استقبال رسائل الطلاب
- إدارة الأبحاث المطلوبة

## هيكل المشروع

```
├── App.tsx                    # نقطة الدخول الرئيسية
├── store/
│   └── AppContext.tsx         # إدارة الحالة المركزية
├── navigation/
│   ├── RootNavigator.tsx      # التنقل الرئيسي
│   ├── StudentTabNavigator.tsx # تبويبات الطالب
│   └── AdminTabNavigator.tsx  # تبويبات المسؤول
├── screens/
│   ├── ModeSelectionScreen.tsx
│   ├── AdminLoginScreen.tsx
│   ├── student/
│   │   ├── StudentProfileScreen.tsx
│   │   ├── StudentBooksScreen.tsx
│   │   ├── StudentStatusScreen.tsx
│   │   └── StudentResearchScreen.tsx
│   └── admin/
│       ├── AdminStudentsScreen.tsx
│       ├── AdminInventoryScreen.tsx
│       ├── AdminTreasuryScreen.tsx
│       ├── AdminSettingsScreen.tsx
│       ├── StudentDetailScreen.tsx
│       ├── AddStudentScreen.tsx
│       ├── BulkAddStudentsScreen.tsx
│       ├── AddProductScreen.tsx
│       ├── AddResearchScreen.tsx
│       └── MessagesScreen.tsx
└── constants/
    └── theme.ts               # الألوان والتصميم
```

## التقنيات المستخدمة
- React Native مع Expo
- React Navigation 7+
- React Native Reanimated للرسوم المتحركة
- AsyncStorage للتخزين المحلي (قريباً)

## نظام الألوان
- الأساسي: #1A5F7A (أزرق داكن)
- الثانوي: #159895 (تركوازي)
- التمييز: #57C5B6 (أخضر فاتح)
- النجاح: #27AE60 (أخضر)
- التحذير: #F39C12 (أصفر/برتقالي)
- الخطأ: #E74C3C (أحمر)

## حالة الطلب
- أصفر: تم الاختيار
- أخضر: تم الدفع
- أزرق/تركوازي: تم التسليم

## المنتجات الافتراضية
1. أدوات - 120 جنيه
2. عضوية - 160 جنيه
3. حياكة - 100 جنيه
4. أسس - 120 جنيه
5. شيتات - 40 جنيه

## التشغيل
```bash
npm run dev
```

## المهام المستقبلية
- [ ] إضافة التخزين المحلي (AsyncStorage)
- [ ] إضافة المزامنة السحابية (اختياري)
- [ ] تصدير كملف APK
