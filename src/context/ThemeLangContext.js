import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeLangContext = createContext();

const dictionary = {
  en: {
    dashboard: 'Dashboard',
    clients: 'Clients',
    orders: 'Orders',
    catalog: 'Catalog',
    signOut: 'Sign Out',
    greetingMorning: 'Good Morning',
    greetingAfternoon: 'Good Afternoon',
    greetingEvening: 'Good Evening',
    admin: 'Administrator',
    execSummary: 'Executive Summary',
    dashSubtitle: 'Welcome back to the Elammary CRM Command Center.',
    totCustomers: 'Total Customers',
    totOrders: 'Total Orders',
    totRevenue: 'Total Revenue',
    activeGrowth: 'Active Growth',
    revInsights: 'Revenue Insights',
    custBase: 'Customer Base',
    recentTrans: 'Recent Transactions',
    viewAll: 'View All',
    customer: 'Customer',
    item: 'Item',
    amount: 'Amount',
    status: 'Status',
  },
  ar: {
    dashboard: 'لوحة القيادة',
    clients: 'العملاء',
    orders: 'الطلبات',
    catalog: 'الكتالوج',
    signOut: 'تسجيل الخروج',
    greetingMorning: 'صباح الخير',
    greetingAfternoon: 'مساء الخير',
    greetingEvening: 'مساء الخير',
    admin: 'مدير النظام',
    execSummary: 'الملخص التنفيذي',
    dashSubtitle: 'مرحباً بك في مركز تحكم العُمري لإدارة العلاقات.',
    totCustomers: 'إجمالي العملاء',
    totOrders: 'إجمالي الطلبات',
    totRevenue: 'إجمالي الإيرادات',
    activeGrowth: 'النمو النشط',
    revInsights: 'رؤى الإيرادات',
    custBase: 'قاعدة العملاء',
    recentTrans: 'المعاملات الأخيرة',
    viewAll: 'عرض الكل',
    customer: 'العميل',
    item: 'العنصر',
    amount: 'المبلغ',
    status: 'الحالة',
  }
};

export function ThemeLangProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const toggleLang = () => setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  
  const t = (key) => dictionary[lang][key] || key;

  return (
    <ThemeLangContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t }}>
      {children}
    </ThemeLangContext.Provider>
  );
}

export const useThemeLang = () => useContext(ThemeLangContext);
