import type {
  User,
  Shop,
  Product,
  Customer,
  Sale,
  Expense,
  Khata,
} from './types';

// Mock data storage (will be replaced with Supabase)
const mockUsers: Map<string, User> = new Map();
const mockShops: Map<string, Shop> = new Map();
const mockProducts: Map<string, Product> = new Map();
const mockCustomers: Map<string, Customer> = new Map();
const mockSales: Map<string, Sale> = new Map();
const mockExpenses: Map<string, Expense> = new Map();
const mockKhata: Map<string, Khata> = new Map();

// Initialize with sample data
function initializeMockData() {
  // Sample shop
  const sampleShop: Shop = {
    id: 'shop-1',
    name: 'Sudha Nepali Store',
    address: '123 Kathmandu, Nepal',
    phone: '+977-1-4123456',
    email: 'shop@shudhanepali.com',
    owner_id: 'user-1',
    category: 'grocery',
    subscription_plan: 'pro',
    subscription_status: 'active',
    language: 'en',
    currency: 'NPR',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockShops.set(sampleShop.id, sampleShop);

  // Sample owner user
  const sampleOwner: User = {
    id: 'user-1',
    email: 'owner@shudhanepali.com',
    name: 'Shop Owner',
    phone: '+977-9801234567',
    shop_id: 'shop-1',
    role: 'owner',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockUsers.set(sampleOwner.id, sampleOwner);

  // Sample manager user
  const sampleManager: User = {
    id: 'user-2',
    email: 'manager@shudhanepali.com',
    name: 'Shop Manager',
    phone: '+977-9802234567',
    shop_id: 'shop-1',
    role: 'manager',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockUsers.set(sampleManager.id, sampleManager);

  // Sample cashier user
  const sampleCashier: User = {
    id: 'user-3',
    email: 'cashier@shudhanepali.com',
    name: 'Shop Cashier',
    phone: '+977-9803234567',
    shop_id: 'shop-1',
    role: 'cashier',
    cashier_pin: '1234',
    can_manage_khata: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockUsers.set(sampleCashier.id, sampleCashier);

  // Sample staff user
  const sampleStaff: User = {
    id: 'user-4',
    email: 'staff@shudhanepali.com',
    name: 'Shop Staff',
    phone: '+977-9804234567',
    shop_id: 'shop-1',
    role: 'staff',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockUsers.set(sampleStaff.id, sampleStaff);

  // Sample products
  const products: Product[] = [
    {
      id: 'prod-1',
      shop_id: 'shop-1',
      sku: 'RICE001',
      name: 'Basmati Rice (10kg)',
      category: 'Grains',
      unit: 'bag',
      cost_price: 450,
      selling_price: 550,
      margin_percentage: 22.2,
      tax_percentage: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      shop_id: 'shop-1',
      sku: 'OIL001',
      name: 'Cooking Oil (2L)',
      category: 'Oils',
      unit: 'bottle',
      cost_price: 180,
      selling_price: 220,
      margin_percentage: 22.2,
      tax_percentage: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      shop_id: 'shop-1',
      sku: 'DAL001',
      name: 'Dal (1kg)',
      category: 'Legumes',
      unit: 'bag',
      cost_price: 80,
      selling_price: 100,
      margin_percentage: 25,
      tax_percentage: 5,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  products.forEach((p) => mockProducts.set(p.id, p));

  // Sample customers
  const customers: Customer[] = [
    {
      id: 'cust-1',
      shop_id: 'shop-1',
      name: 'Ramesh Sharma',
      phone: '+977-9841234567',
      email: 'ramesh@example.com',
      address: 'Kathmandu',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cust-2',
      shop_id: 'shop-1',
      name: 'Priya Paudel',
      phone: '+977-9842234567',
      email: 'priya@example.com',
      address: 'Bhaktapur',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  customers.forEach((c) => mockCustomers.set(c.id, c));

  // Sample khata entries
  const khataEntries: Khata[] = [
    {
      id: 'khata-1',
      shop_id: 'shop-1',
      customer_id: 'cust-1',
      total_credit: 5000,
      total_paid: 2000,
      balance: 3000,
      last_transaction_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'khata-2',
      shop_id: 'shop-1',
      customer_id: 'cust-2',
      total_credit: 2500,
      total_paid: 2500,
      balance: 0,
      last_transaction_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  khataEntries.forEach((k) => mockKhata.set(k.id, k));
}

// Initialize mock data on import
initializeMockData();

// Authentication API
export const authAPI = {
  async login(email: string, password: string): Promise<{ user: User; shop: Shop }> {
    // Mock validation - in production, hash and verify password with bcrypt
    const user = Array.from(mockUsers.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('User not found. Please check your email address or sign up to create an account.');
    }
    // In production, verify password hash
    if (password !== 'password') {
      throw new Error('Invalid credentials. Password is incorrect.');
    }
    const shop = mockShops.get(user.shop_id);
    if (!shop) {
      throw new Error('Shop not found. Please contact support.');
    }
    return { user, shop };
  },

  async register(
    email: string,
    password: string,
    name: string,
    shopName: string,
    phone: string,
    category: string = 'general',
    language: 'en' | 'ne' = 'en',
    tableMode?: boolean,
    totalTables?: number
  ): Promise<{ user: User; shop: Shop; cashierEmail?: string }> {
    // Check if user exists
    if (Array.from(mockUsers.values()).some((u) => u.email === email)) {
      throw new Error('User already exists');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Create shop with category and language
    const shopId = `shop-${Date.now()}`;
    const ownerId = `user-${Date.now()}`;
    const cashierId = `user-${Date.now() + 1}`;
    
    const shop: Shop = {
      id: shopId,
      name: shopName,
      address: '',
      phone,
      email,
      owner_id: ownerId,
      category: category as any,
      subscription_plan: 'free',
      subscription_status: 'active',
      language,
      currency: 'NPR',
      table_mode_enabled: tableMode || false,
      total_tables: totalTables || 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockShops.set(shop.id, shop);

    // Create owner user
    const user: User = {
      id: ownerId,
      email,
      name,
      phone,
      shop_id: shop.id,
      role: 'owner',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsers.set(user.id, user);

    // Auto-create cashier account
    const cashierEmail = `cashier-${shopId}@shudhanepali.com`;
    const cashier: User = {
      id: cashierId,
      email: cashierEmail,
      name: 'Cashier Account',
      phone,
      shop_id: shop.id,
      role: 'cashier',
      cashier_pin: '1234', // Default PIN
      can_manage_khata: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsers.set(cashier.id, cashier);

    return { user, shop, cashierEmail };
  },

  async logout(): Promise<void> {
    // Clear session
  },
};

// Products API
export const productsAPI = {
  async getProducts(shopId: string): Promise<Product[]> {
    return Array.from(mockProducts.values()).filter((p) => p.shop_id === shopId);
  },

  async getProduct(productId: string): Promise<Product> {
    const product = mockProducts.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  async createProduct(product: Product): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const newProduct = { ...product, id };
    mockProducts.set(id, newProduct);
    return newProduct;
  },

  async updateProduct(product: Product): Promise<Product> {
    if (!mockProducts.has(product.id)) {
      throw new Error('Product not found');
    }
    mockProducts.set(product.id, product);
    return product;
  },

  async deleteProduct(productId: string): Promise<void> {
    mockProducts.delete(productId);
  },
};

// Customers API
export const customersAPI = {
  async getCustomers(shopId: string): Promise<Customer[]> {
    return Array.from(mockCustomers.values()).filter((c) => c.shop_id === shopId);
  },

  async getCustomer(customerId: string): Promise<Customer> {
    const customer = mockCustomers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  },

  async createCustomer(customer: Customer): Promise<Customer> {
    const id = `cust-${Date.now()}`;
    const newCustomer = { ...customer, id };
    mockCustomers.set(id, newCustomer);
    return newCustomer;
  },

  async updateCustomer(customer: Customer): Promise<Customer> {
    if (!mockCustomers.has(customer.id)) {
      throw new Error('Customer not found');
    }
    mockCustomers.set(customer.id, customer);
    return customer;
  },

  async deleteCustomer(customerId: string): Promise<void> {
    mockCustomers.delete(customerId);
  },
};

// Sales API
export const salesAPI = {
  async getSales(shopId: string): Promise<Sale[]> {
    return Array.from(mockSales.values()).filter((s) => s.shop_id === shopId);
  },

  async createSale(sale: Sale): Promise<Sale> {
    const id = `sale-${Date.now()}`;
    const newSale = { ...sale, id };
    mockSales.set(id, newSale);
    return newSale;
  },

  async updateSale(sale: Sale): Promise<Sale> {
    if (!mockSales.has(sale.id)) {
      throw new Error('Sale not found');
    }
    mockSales.set(sale.id, sale);
    return sale;
  },
};

// Khata API
export const khataAPI = {
  async getKhata(shopId: string): Promise<Khata[]> {
    return Array.from(mockKhata.values()).filter((k) => k.shop_id === shopId);
  },

  async getCustomerKhata(customerId: string): Promise<Khata> {
    const khata = Array.from(mockKhata.values()).find((k) => k.customer_id === customerId);
    if (!khata) {
      throw new Error('Khata not found');
    }
    return khata;
  },

  async createKhata(khata: Khata): Promise<Khata> {
    const id = `khata-${Date.now()}`;
    const newKhata = { ...khata, id };
    mockKhata.set(id, newKhata);
    return newKhata;
  },

  async updateKhataBalance(khataId: string, amount: number): Promise<Khata> {
    const khata = mockKhata.get(khataId);
    if (!khata) {
      throw new Error('Khata not found');
    }
    khata.balance += amount;
    khata.updated_at = new Date().toISOString();
    mockKhata.set(khataId, khata);
    return khata;
  },
};

// Expenses API
export const expensesAPI = {
  async getExpenses(shopId: string): Promise<Expense[]> {
    return Array.from(mockExpenses.values()).filter((e) => e.shop_id === shopId);
  },

  async createExpense(expense: Expense): Promise<Expense> {
    const id = `exp-${Date.now()}`;
    const newExpense = { ...expense, id };
    mockExpenses.set(id, newExpense);
    return newExpense;
  },

  async updateExpense(expense: Expense): Promise<Expense> {
    if (!mockExpenses.has(expense.id)) {
      throw new Error('Expense not found');
    }
    mockExpenses.set(expense.id, expense);
    return expense;
  },

  async deleteExpense(expenseId: string): Promise<void> {
    mockExpenses.delete(expenseId);
  },
};

// Helper to get all mock data (useful for testing)
export const getMockData = () => ({
  users: Array.from(mockUsers.values()),
  shops: Array.from(mockShops.values()),
  products: Array.from(mockProducts.values()),
  customers: Array.from(mockCustomers.values()),
  sales: Array.from(mockSales.values()),
  expenses: Array.from(mockExpenses.values()),
  khata: Array.from(mockKhata.values()),
});
