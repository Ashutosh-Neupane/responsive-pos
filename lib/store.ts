import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Shop,
  Product,
  Inventory,
  Sale,
  Customer,
  Khata,
  Expense,
  DashboardStats,
} from './types';

// Auth Store
interface AuthState {
  user: User | null;
  shop: Shop | null;
  shops: Shop[]; // Multiple shops support
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, shop: Shop, shops?: Shop[]) => void;
  switchShop: (shopId: string) => void; // Switch between shops
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      shop: null,
      shops: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hydrated: false,
      setHydrated: (hydrated: boolean) => set({ hydrated }),
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        // Mock login - will be replaced with real API
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));
          // This will be replaced with actual authentication
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
        }
      },
      logout: () => {
        set({
          user: null,
          shop: null,
          shops: [],
          isAuthenticated: false,
          error: null,
        });
      },
      setUser: (user: User, shop: Shop, shops?: Shop[]) => {
        set({
          user,
          shop,
          shops: shops && shops.length > 0 ? shops : [shop],
          isAuthenticated: true,
          error: null,
        });
      },
      switchShop: (shopId: string) => {
        const state = get();
        const selectedShop = state.shops.find((s) => s.id === shopId);
        if (selectedShop) {
          set({ shop: selectedShop });
        }
      },
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    }
  )
);

// POS Store (Current Sale in Progress)
interface POSState {
  currentSale: Partial<Sale> | null;
  selectedTable?: number;
  addItem: (item: any) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearSale: () => void;
  setSale: (sale: Partial<Sale>) => void;
  setTable: (tableNumber: number) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  currentSale: null,
  selectedTable: undefined,
  addItem: (item) =>
    set((state) => {
      if (!state.currentSale || !state.currentSale.items) {
        return {
          currentSale: {
            items: [item],
            total_amount: item.total_amount || 0,
          },
        };
      }
      const items = [...state.currentSale.items];
      const existingItemIndex = items.findIndex(
        (i) => i.product_id === item.product_id
      );
      if (existingItemIndex > -1) {
        items[existingItemIndex] = {
          ...items[existingItemIndex],
          quantity: (items[existingItemIndex].quantity || 0) + (item.quantity || 1),
        };
      } else {
        items.push(item);
      }
      return {
        currentSale: {
          ...state.currentSale,
          items,
        },
      };
    }),
  removeItem: (itemId) =>
    set((state) => {
      if (!state.currentSale || !state.currentSale.items) return state;
      return {
        currentSale: {
          ...state.currentSale,
          items: state.currentSale.items.filter((i) => i.id !== itemId),
        },
      };
    }),
  updateItemQuantity: (itemId, quantity) =>
    set((state) => {
      if (!state.currentSale || !state.currentSale.items) return state;
      const items = state.currentSale.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      return {
        currentSale: {
          ...state.currentSale,
          items,
        },
      };
    }),
  clearSale: () => set({ currentSale: null, selectedTable: undefined }),
  setSale: (sale) => set({ currentSale: sale }),
  setTable: (tableNumber) => set({ selectedTable: tableNumber }),
}));

// Products Store
interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (shopId?: string) => Promise<void>; // Shop filtering
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  searchProducts: (query: string) => Product[];
  getProductsByShop: (shopId: string) => Product[];
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,
      fetchProducts: async (shopId?: string) => {
        set({ isLoading: true });
        // Mock fetch - will be replaced with real API
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          // Will filter by shopId when data comes from API
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch products',
          });
        }
      },
      addProduct: (product) => {
        set((state) => ({
          products: [...state.products, product],
        }));
        
        // Auto-create inventory for new product
        const { addInventoryItem } = useInventoryStore.getState();
        const existingInventory = useInventoryStore.getState().inventory.find(i => i.product_id === product.id);
        if (!existingInventory) {
          addInventoryItem({
            id: `inv-${product.id}`,
            shop_id: product.shop_id,
            product_id: product.id,
            quantity: product.stock_quantity || 0,
            reorder_level: product.reorder_level || 10,
            last_count_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      },
      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p)),
        })),
      deleteProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        })),
      searchProducts: (query) => {
        const state = get();
        return state.products.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase())
        );
      },
      getProductsByShop: (shopId) => {
        const state = get();
        return state.products.filter((p) => p.shop_id === shopId);
      },
    }),
    {
      name: 'products-store',
    }
  )
);

// Inventory Store
interface InventoryState {
  inventory: Inventory[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  getProductStock: (productId: string) => number;
  updateStock: (productId: string, quantity: number) => void;
  addInventoryItem: (item: Inventory) => void;
  getLowStockProducts: () => Inventory[];
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventory: [],
      isLoading: false,
      error: null,
      fetchInventory: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch inventory',
          });
        }
      },
      getProductStock: (productId) => {
        const state = get();
        const item = state.inventory.find((i) => i.product_id === productId);
        return item?.quantity ?? 0;
      },
      updateStock: (productId, quantity) =>
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.product_id === productId ? { ...item, quantity, updated_at: new Date().toISOString() } : item
          ),
        })),
      addInventoryItem: (item) =>
        set((state) => ({
          inventory: [...state.inventory, item],
        })),
      getLowStockProducts: () => {
        const state = get();
        return state.inventory.filter((item) => item.quantity <= item.reorder_level);
      },
    }),
    {
      name: 'inventory-store',
    }
  )
);

// Customers Store
interface CustomersState {
  customers: Customer[];
  khata: Khata[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  getCustomerKhata: (customerId: string) => Khata | undefined;
  updateKhataBalance: (khataId: string, amount: number) => void;
}

export const useCustomersStore = create<CustomersState>()(
  persist(
    (set, get) => ({
      customers: [],
      khata: [],
      isLoading: false,
      error: null,
      fetchCustomers: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch customers',
          });
        }
      },
      addCustomer: (customer) =>
        set((state) => ({
          customers: [...state.customers, customer],
        })),
      updateCustomer: (customer) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === customer.id ? customer : c)),
        })),
      getCustomerKhata: (customerId) => {
        const state = get();
        return state.khata.find((k) => k.customer_id === customerId);
      },
      updateKhataBalance: (khataId, amount) =>
        set((state) => ({
          khata: state.khata.map((k) =>
            k.id === khataId ? { ...k, balance: k.balance + amount } : k
          ),
        })),
    }),
    {
      name: 'customers-store',
    }
  )
);

// Sales History Store
interface SalesState {
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  addSale: (sale: Sale) => void;
  getSalesToday: () => Sale[];
  getTotalSalesToday: () => number;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: [],
      isLoading: false,
      error: null,
      fetchSales: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch sales',
          });
        }
      },
      addSale: (sale) =>
        set((state) => ({
          sales: [...state.sales, sale],
        })),
      getSalesToday: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.sales.filter(
          (sale) => new Date(sale.created_at).toDateString() === today
        );
      },
      getTotalSalesToday: () => {
        return get()
          .getSalesToday()
          .reduce((sum, sale) => sum + sale.total_amount, 0);
      },
    }),
    {
      name: 'sales-store',
    }
  )
);

// Expenses Store
interface ExpensesState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => void;
  getExpensesToday: () => Expense[];
  getTotalExpensesToday: () => number;
}

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set, get) => ({
      expenses: [],
      isLoading: false,
      error: null,
      fetchExpenses: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch expenses',
          });
        }
      },
      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, expense],
        })),
      getExpensesToday: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.expenses.filter(
          (expense) => new Date(expense.expense_date).toDateString() === today
        );
      },
      getTotalExpensesToday: () => {
        return get()
          .getExpensesToday()
          .reduce((sum, expense) => sum + expense.amount, 0);
      },
    }),
    {
      name: 'expenses-store',
    }
  )
);

// Dashboard Store (Aggregated Stats)
interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  refreshStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  refreshStats: async () => {
    set({ isLoading: true });
    try {
      // This will aggregate data from other stores
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));

// UI Preferences Store (Language, Theme)
interface UIState {
  language: 'en' | 'ne';
  theme: any | null;
  setLanguage: (language: 'en' | 'ne') => void;
  setTheme: (theme: any) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: null,
      setLanguage: (language: 'en' | 'ne') => set({ language }),
      setTheme: (theme: any) => set({ theme }),
    }),
    {
      name: 'ui-store',
    }
  )
);
