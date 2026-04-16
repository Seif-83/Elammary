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
    /* Orders Page */
    transLedger: 'Transaction Ledger',
    transSubtitle: 'Track and manage every piece of furniture sold.',
    createTrans: 'Create Transaction',
    filterClientItem: 'Filter by client or item...',
    noTransFound: 'No transactions found',
    transIdClient: 'Transaction ID / Client',
    itemDesc: 'Item Description',
    value: 'Value',
    workflowStatus: 'Workflow Status',
    date: 'Date',
    actions: 'Actions',
    all: 'ALL',
    pending: 'PENDING',
    inProgress: 'IN-PROGRESS',
    delivered: 'DELIVERED',
    /* Products Page */
    curatedCol: 'Curated Collection',
    curatedSub: 'Refining the furniture catalog for premium spaces.',
    regDesign: 'Register Design',
    searchCat: 'Search catalog...',
    noCatalogEntry: 'Catalogue entry not found',
    unitsReserve: 'Units in Reserve',
    noDesc: 'No description available for this curated piece.',
    /* Customers Page */
    clientDir: 'Client Directory',
    clientDirSub: 'Manage your high-value client relationships.',
    addClient: 'Add Client',
    searchClients: 'Search clients...',
    noClients: 'No clients found matching your criteria',
    clientName: 'Client Name',
    tierStatus: 'Tier Status',
    phoneContact: 'Phone / Contact',
    lifetimeValue: 'Lifetime Value',
    vip: 'VIP',
    loyal: 'LOYAL',
    regular: 'REGULAR',
    /* Customer Detail */
    retDir: 'Return to Directory',
    phone: 'Phone',
    address: 'Address',
    noAddr: 'No address stored',
    lifetimePort: 'Lifetime Portfolio Value',
    purchHistory: 'Purchasing History',
    logTrans: 'Log Transaction',
    noRegTrans: 'No registered transactions for this client yet.',
    acqValue: 'Acquisition Value',
    currStatus: 'Current Status',
    regDate: 'Registered Date',
    vipSel: 'VIP Selection',
    loyalClient: 'Loyal Client',
    standard: 'Standard',
    
    /* Modals Common */
    discard: 'Discard',
    cancel: 'Cancel',
    saveOrder: 'Save Order',
    saveCustomer: 'Save Customer',
    saveDesign: 'Save Design',
    syncing: 'Syncing...',
    saving: 'Saving...',
    updating: 'Updating...',

    /* Orders Modal */
    modTrans: 'Modify Transaction',
    newTrans: 'New Transaction',
    clientSel: 'Client Selection *',
    chooseClient: '— Choose a client —',
    prodLookup: 'Product Lookup',
    pickCatOpt: '— Pick from catalog (optional) —',
    descReq: 'Description *',
    egDesc: 'e.g. Vintage Oak Desk',
    totalAmt: 'Total Amount *',
    orderStatus: 'Order Status',
    transDate: 'Transaction Date',

    /* Products Modal */
    refineProduct: 'Refine Product',
    registryEntry: 'Registry Entry',
    prodMoniker: 'Product Moniker *',
    egMoniker: 'e.g. Minimalist Velvet Sofa',
    classification: 'Classification *',
    select: '— Select —',
    unitPrice: 'Unit Price *',
    designDesc: 'Design Description',
    dimMat: 'Dimensions, materials...',
    inventoryCount: 'Inventory Count',

    /* Customers Modal */
    editProfile: 'Edit Profile',
    newCustomer: 'New Customer',
    fullName: 'Full Name *',
    egName: 'e.g. John Doe',
    phoneNumber: 'Phone Number',
    egPhone: '+1 (555) 000-0000',
    physAddress: 'Physical Address',
    shippingDet: 'Shipping details...',
    privateNotes: 'Private Notes',
    specialPref: 'Special preferences...',

    /* Customer Detail Modal */
    editRecord: 'Edit Record',
    logNewSale: 'Log New Sale',
    catSelect: 'Catalog Select',
    pickDesign: '— Pick a design —',
    itemReq: 'Item *',
    priceReq: 'Price *'
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
    /* Orders Page */
    transLedger: 'دفتر المعاملات',
    transSubtitle: 'تتبع وإدارة كل قطعة أثاث تم بيعها.',
    createTrans: 'إنشاء معاملة',
    filterClientItem: 'تصفية حسب العميل أو العنصر...',
    noTransFound: 'لم يتم العثور على معاملات',
    transIdClient: 'معرف المعاملة / العميل',
    itemDesc: 'وصف العنصر',
    value: 'القيمة',
    workflowStatus: 'حالة العمل',
    date: 'التاريخ',
    actions: 'إجراءات',
    all: 'الكل',
    pending: 'قيد الانتظار',
    inProgress: 'قيد التنفيذ',
    delivered: 'تم التوصيل',
    /* Products Page */
    curatedCol: 'مجموعة منتقاة',
    curatedSub: 'تحديث كتالوج الأثاث للمساحات الفاخرة.',
    regDesign: 'تسجيل تصميم',
    searchCat: 'ابحث في الكتالوج...',
    noCatalogEntry: 'لم يتم العثور على العنصر',
    unitsReserve: 'وحدات في الاحتياطي',
    noDesc: 'لا يوجد وصف متاح لهذه القطعة.',
    /* Customers Page */
    clientDir: 'دليل العملاء',
    clientDirSub: 'إدارة علاقات عملائك ذوي القيمة العالية.',
    addClient: 'إضافة عميل',
    searchClients: 'ابحث عن العملاء...',
    noClients: 'لم يتم العثور على عملاء يطابقون بحثك',
    clientName: 'اسم العميل',
    tierStatus: 'المستوى',
    phoneContact: 'الهاتف / الاتصال',
    lifetimeValue: 'القيمة الإجمالية',
    vip: 'كبار الشخصيات',
    loyal: 'مخلص',
    regular: 'عادي',
    /* Customer Detail */
    retDir: 'العودة للدليل',
    phone: 'هاتف',
    address: 'العنوان',
    noAddr: 'لا يوجد عنوان محفوظ',
    lifetimePort: 'قيمة محفظة العميل مدى الحياة',
    purchHistory: 'سجل المشتريات',
    logTrans: 'تسجيل معاملة',
    noRegTrans: 'لا توجد معاملات مسجلة لهذا العميل حتى الآن.',
    acqValue: 'قيمة الاستحواذ',
    currStatus: 'الحالة الحالية',
    regDate: 'تاريخ التسجيل',
    vipSel: 'اختيار كبار الشخصيات',
    loyalClient: 'عميل مخلص',
    standard: 'عادي',

    /* Modals Common */
    discard: 'إلغاء',
    cancel: 'إلغاء',
    saveOrder: 'حفظ الطلب',
    saveCustomer: 'حفظ العميل',
    saveDesign: 'حفظ التصميم',
    syncing: 'جاري المزامنة...',
    saving: 'جاري الحفظ...',
    updating: 'جاري التحديث...',

    /* Orders Modal */
    modTrans: 'تعديل المعاملة',
    newTrans: 'معاملة جديدة',
    clientSel: 'اختيار العميل *',
    chooseClient: '— اختر عميلاً —',
    prodLookup: 'البحث عن منتج',
    pickCatOpt: '— اختر من الكتالوج (اختياري) —',
    descReq: 'الوصف *',
    egDesc: 'مثال: مكتب بلوط كلاسيكي',
    totalAmt: 'المبلغ الإجمالي *',
    orderStatus: 'حالة الطلب',
    transDate: 'تاريخ المعاملة',

    /* Products Modal */
    refineProduct: 'تحسين المنتج',
    registryEntry: 'إدخال السجل',
    prodMoniker: 'اسم المنتج *',
    egMoniker: 'مثال: أريكة مخملية بسيطة',
    classification: 'التصنيف *',
    select: '— اختر —',
    unitPrice: 'سعر الوحدة *',
    designDesc: 'وصف التصميم',
    dimMat: 'الأبعاد، المواد...',
    inventoryCount: 'الكمية في المخزون',

    /* Customers Modal */
    editProfile: 'تعديل الملف الشخصي',
    newCustomer: 'عميل جديد',
    fullName: 'الاسم الكامل *',
    egName: 'مثال: جون دو',
    phoneNumber: 'رقم الهاتف',
    egPhone: '0000-000 (555) 1+',
    physAddress: 'العنوان الفعلي',
    shippingDet: 'تفاصيل الشحن...',
    privateNotes: 'ملاحظات خاصة',
    specialPref: 'تفضيلات خاصة...',

    /* Customer Detail Modal */
    editRecord: 'تعديل السجل',
    logNewSale: 'تسجيل بيع جديد',
    catSelect: 'اختيار من الكتالوج',
    pickDesign: '— اختر تصميماً —',
    itemReq: 'العنصر *',
    priceReq: 'السعر *'
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
