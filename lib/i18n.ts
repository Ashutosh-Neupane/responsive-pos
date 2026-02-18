// Internationalization (i18n) System
// Bilingual support: English (en) and Nepali (ne)

export type Language = 'en' | 'ne';

export const translations = {
  // Navigation & General
  dashboard: {
    en: 'Dashboard',
    ne: 'ड्यासबोर्ड',
  },
  products: {
    en: 'Products',
    ne: 'उत्पादनहरु',
  },
  inventory: {
    en: 'Inventory',
    ne: 'सामग्री',
  },
  khata: {
    en: 'Khata',
    ne: 'खाता',
  },
  customers: {
    en: 'Customers',
    ne: 'ग्राहकहरु',
  },
  sales: {
    en: 'Sales',
    ne: 'बिक्रय',
  },
  pos: {
    en: 'POS',
    ne: 'POS',
  },
  expenses: {
    en: 'Expenses',
    ne: 'खर्च',
  },
  analytics: {
    en: 'Analytics',
    ne: 'विश्लेषण',
  },
  settings: {
    en: 'Settings',
    ne: 'सेटिङ्गहरु',
  },
  logout: {
    en: 'Logout',
    ne: 'लगआउट',
  },

  // User Roles
  owner: {
    en: 'Owner',
    ne: 'मालिक',
  },
  cashier: {
    en: 'Cashier',
    ne: 'क्यासियर',
  },
  manager: {
    en: 'Manager',
    ne: 'प्रबन्धक',
  },
  staff: {
    en: 'Staff',
    ne: 'कर्मचारी',
  },

  // Auth Pages
  login: {
    en: 'Login',
    ne: 'लगइन',
  },
  register: {
    en: 'Register',
    ne: 'दर्ता गर्नुहोस्',
  },
  email: {
    en: 'Email',
    ne: 'ईमेल',
  },
  password: {
    en: 'Password',
    ne: 'पासवर्ड',
  },
  forgotPassword: {
    en: 'Forgot Password?',
    ne: 'पासवर्ड भुलनुभयो?',
  },
  resetPassword: {
    en: 'Reset Password',
    ne: 'पासवर्ड रिसेट गर्नुहोस्',
  },
  changePassword: {
    en: 'Change Password',
    ne: 'पासवर्ड परिवर्तन गर्नुहोस्',
  },
  currentPassword: {
    en: 'Current Password',
    ne: 'हालको पासवर्ड',
  },
  newPassword: {
    en: 'New Password',
    ne: 'नयाँ पासवर्ड',
  },
  confirmPassword: {
    en: 'Confirm Password',
    ne: 'पासवर्ड पुष्टि गर्नुहोस्',
  },
  signUp: {
    en: 'Sign Up',
    ne: 'साइन अप गर्नुहोस्',
  },
  alreadyHaveAccount: {
    en: 'Already have an account?',
    ne: 'पहिले नै खाता छ?',
  },
  dontHaveAccount: {
    en: "Don't have an account?",
    ne: 'खाता छैन?',
  },
  demoCredentials: {
    en: 'Demo Credentials',
    ne: 'डेमो क्रेडेन्शियल',
  },
  owner_credential: {
    en: 'Owner',
    ne: 'मालिक',
  },
  cashier_credential: {
    en: 'Cashier (with PIN 1234)',
    ne: 'क्यासियर (PIN 1234 सहित)',
  },

  // Store Setup
  createStore: {
    en: 'Create Store',
    ne: 'स्टोर सृजना गर्नुहोस्',
  },
  storeName: {
    en: 'Store Name',
    ne: 'स्टोर नाम',
  },
  storeCategory: {
    en: 'Store Category',
    ne: 'स्टोर श्रेणी',
  },
  storeAddress: {
    en: 'Store Address',
    ne: 'स्टोर ठेगाना',
  },
  storePhone: {
    en: 'Store Phone',
    ne: 'स्टोर फोन',
  },
  storeEmail: {
    en: 'Store Email',
    ne: 'स्टोर ईमेल',
  },
  storeOwnerName: {
    en: 'Owner Name',
    ne: 'मालिकको नाम',
  },
  selectCategory: {
    en: 'Select a category',
    ne: 'श्रेणी छान्नुहोस्',
  },

  // Categories
  grocery: {
    en: 'Grocery',
    ne: 'किराना',
  },
  pharmacy: {
    en: 'Pharmacy',
    ne: 'औषधी पसल',
  },
  restaurant: {
    en: 'Restaurant',
    ne: 'रेस्टुरेन्ट',
  },
  retail: {
    en: 'Retail',
    ne: 'खुद्रा',
  },
  clothing: {
    en: 'Clothing',
    ne: 'लुगा',
  },
  electronics: {
    en: 'Electronics',
    ne: 'इलेक्ट्रनिक्स',
  },
  general: {
    en: 'General',
    ne: 'सामान्य',
  },

  // Khata (Credit Management)
  addCredit: {
    en: 'Add Credit',
    ne: 'क्रेडिट जोड्नुहोस्',
  },
  removeCredit: {
    en: 'Remove Credit',
    ne: 'क्रेडिट हटाउनुहोस्',
  },
  khataBalance: {
    en: 'Khata Balance',
    ne: 'खाता ब्यालेन्स',
  },
  customerName: {
    en: 'Customer Name',
    ne: 'ग्राहक नाम',
  },
  customerPhone: {
    en: 'Customer Phone',
    ne: 'ग्राहक फोन',
  },
  totalCredit: {
    en: 'Total Credit',
    ne: 'कुल क्रेडिट',
  },
  totalPaid: {
    en: 'Total Paid',
    ne: 'कुल भुक्तानी',
  },
  enterPin: {
    en: 'Enter PIN',
    ne: 'PIN प्रविष्ट गर्नुहोस्',
  },
  cashierPin: {
    en: 'Cashier PIN',
    ne: 'क्यासियर PIN',
  },
  requestApproval: {
    en: 'Request Approval',
    ne: 'अनुमोदनको लागि अनुरोध गर्नुहोस्',
  },
  pendingApprovals: {
    en: 'Pending Approvals',
    ne: 'प्रतिक्षमा अनुमोदनहरु',
  },
  approve: {
    en: 'Approve',
    ne: 'अनुमोदन गर्नुहोस्',
  },
  reject: {
    en: 'Reject',
    ne: 'अस्वीकार गर्नुहोस्',
  },

  // Products
  productName: {
    en: 'Product Name',
    ne: 'उत्पाद नाम',
  },
  productCategory: {
    en: 'Product Category',
    ne: 'उत्पाद श्रेणी',
  },
  sku: {
    en: 'SKU',
    ne: 'SKU',
  },
  costPrice: {
    en: 'Cost Price',
    ne: 'लागत मूल्य',
  },
  sellingPrice: {
    en: 'Selling Price',
    ne: 'बिक्रय मूल्य',
  },
  quantity: {
    en: 'Quantity',
    ne: 'परिमाण',
  },
  unit: {
    en: 'Unit',
    ne: 'एकाई',
  },
  addProduct: {
    en: 'Add Product',
    ne: 'उत्पाद थप्नुहोस्',
  },
  editProduct: {
    en: 'Edit Product',
    ne: 'उत्पाद सम्पादन गर्नुहोस्',
  },
  deleteProduct: {
    en: 'Delete Product',
    ne: 'उत्पाद हटाउनुहोस्',
  },

  // Messages & Alerts
  success: {
    en: 'Success',
    ne: 'सफल',
  },
  error: {
    en: 'Error',
    ne: 'त्रुटि',
  },
  warning: {
    en: 'Warning',
    ne: 'चेतावनी',
  },
  info: {
    en: 'Information',
    ne: 'जानकारी',
  },
  required: {
    en: 'This field is required',
    ne: 'यो क्षेत्र आवश्यक छ',
  },
  invalidEmail: {
    en: 'Invalid email address',
    ne: 'अमान्य ईमेल ठेगाना',
  },
  passwordMismatch: {
    en: 'Passwords do not match',
    ne: 'पासवर्डहरु मेल खाँदैनन्',
  },
  wrongPin: {
    en: 'Incorrect PIN',
    ne: 'गलत PIN',
  },

  // Buttons
  submit: {
    en: 'Submit',
    ne: 'जमा गर्नुहोस्',
  },
  cancel: {
    en: 'Cancel',
    ne: 'रद्द गर्नुहोस्',
  },
  save: {
    en: 'Save',
    ne: 'बचत गर्नुहोस्',
  },
  add: {
    en: 'Add',
    ne: 'जोड्नुहोस्',
  },
  edit: {
    en: 'Edit',
    ne: 'सम्पादन गर्नुहोस्',
  },
  delete: {
    en: 'Delete',
    ne: 'हटाउनुहोस्',
  },
  back: {
    en: 'Back',
    ne: 'पछाडी',
  },
  next: {
    en: 'Next',
    ne: 'अगाडि',
  },
  finish: {
    en: 'Finish',
    ne: 'समाप्त गर्नुहोस्',
  },
};

// Get translation with fallback to English
export const getTranslation = (key: string, language: Language = 'en'): string => {
  const translation = (translations as any)[key];
  if (!translation) return key;
  return translation[language] || translation['en'] || key;
};

// Create a context-aware translator
export const createTranslator = (language: Language) => {
  return (key: string): string => getTranslation(key, language);
};
