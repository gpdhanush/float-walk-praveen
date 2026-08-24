import { create } from 'zustand';
import { api } from '@/services/api';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  whatsapp?: string;
  altContact?: string;
  gender?: string;
  address: string;
  notes: string;
  deleted_at: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  deleted_at: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
}

export interface InvoiceItem {
  productName: string;
  quantity: number;
  scan?: number;
  price: number;
  total: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
}

export interface Invoice {
  paidAmount: number;
  id: string;
  invoiceNumber?: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  grandTotal: number;
  totalAmount?: number;
  advancePaid: number;
  balanceDue?: number;
  status: 'paid' | 'pending' | 'partial' | 'hold';
  payments: PaymentRecord[];
  notes: string;
  date: string;
  type?: 'Invoice' | 'Advance Payment';
  created_at: string;
}

interface DataState {
  customers: Customer[];
  expenses: Expense[];
  products: Product[];
  invoices: Invoice[];
  dataFetched: boolean;
  isLoading: boolean;

  // Actions
  fetchData: () => Promise<void>;

  // Customers
  addCustomer: (c: Omit<Customer, 'id' | 'created_at' | 'deleted_at'>) => Promise<string | null>;
  updateCustomer: (id: string, c: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Expenses
  addExpense: (e: Omit<Expense, 'id' | 'created_at' | 'deleted_at'>) => Promise<void>;
  updateExpense: (id: string, e: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Products
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: number, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;

  // Invoices
  addInvoice: (inv: Partial<Invoice> & Pick<Invoice, 'customerId' | 'items'>) => Promise<string>;
  updateInvoice: (id: string, inv: Partial<Invoice>) => Promise<void>;
  convertAdvanceToInvoice: (id: string) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  fetchInvoice: (id: string, options?: { force?: boolean }) => Promise<Invoice | null>;
  addPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  customers: [],
  expenses: [],
  products: [],
  invoices: [],
  dataFetched: false,
  isLoading: false,

  fetchData: async () => {
    // Prevent multiple simultaneous fetches
    if (get().dataFetched || get().isLoading) return;
    
    set({ isLoading: true });
    console.log('🔄 Starting data fetch...');
    
    try {
      // Add 5-second delay to simulate slow network and see loader
      const [customersRes, invoicesRes, expensesRes, productsRes] = await Promise.all([
        api.get('/customers?limit=100').then(async (res) => {
          // await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
          return res;
        }),
        api.get('/invoices?limit=100'),
        api.get('/expenses?limit=100'),
        api.get('/products?limit=200'),
      ]);
      
      console.log('✅ Data fetched successfully', {
        customers: customersRes.data?.length || 0,
        invoices: invoicesRes.data?.length || 0,
        expenses: expensesRes.data?.length || 0,
        products: productsRes.data?.length || 0,
      });
      
      const normalizeExpense = (e: any): Expense => ({
        id: String(e.id),
        category: String(e.category ?? ''),
        amount: Number(e.amount ?? 0),
        description: String(e.description ?? ''),
        date: String(e.date ?? e.expenseDate ?? ''),
        deleted_at: (e.deleted_at ?? e.deletedAt ?? null) as string | null,
        created_at: String(e.created_at ?? e.createdAt ?? ''),
      });

      set({ 
        customers: customersRes.data || [], 
        invoices: invoicesRes.data || [],
        expenses: (expensesRes.data || []).map(normalizeExpense),
        products: productsRes.data || [],
        dataFetched: true,
        isLoading: false
      });
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      set({ isLoading: false });
    }
  },

  addCustomer: async (c, excludeId?: string) => {
    try {
      const existing = get().customers.find(x => x.mobile === c.mobile && !x.deleted_at && x.id !== excludeId);
      if (existing) return null;
      
      const payload = {
        name: c.name,
        mobile: c.mobile,
        email: c.email || null,
        address: c.address,
        whatsapp: c.whatsapp || null,
        altContact: c.altContact || null,
        gender: c.gender || null,
        notes: c.notes,
      };

      const res = await api.post('/customers', payload);
      const data = (res && typeof res === 'object' && 'success' in res) ? (res as any).data : (res as any)?.data ?? res;
      const newCustomer = { ...c, ...data, created_at: data.created_at || new Date().toISOString() };
      set(s => ({ customers: [...s.customers, newCustomer] }));
      return data.id;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  updateCustomer: async (id, c) => {
    await api.patch(`/customers/${id}`, c);
    set(s => ({
      customers: s.customers.map(x => x.id === id ? { ...x, ...c } : x)
    }));
  },
  deleteCustomer: async (id) => {
    await api.delete(`/customers/${id}`);
    set(s => ({
      customers: s.customers.map(x => x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x)
    }));
  },

  addExpense: async (e) => {
    const payload = {
      category: e.category,
      amount: e.amount,
      description: e.description ?? null,
      expenseDate: e.date, // backend expects expenseDate (ISO)
    };
    const res = await api.post('/expenses', payload);
    const raw = (res && typeof res === 'object' && 'success' in res) ? (res as any).data : (res as any)?.data ?? res;
    const data: Expense = {
      id: String(raw.id),
      category: String(raw.category ?? ''),
      amount: Number(raw.amount ?? 0),
      description: String(raw.description ?? ''),
      date: String(raw.date ?? raw.expenseDate ?? e.date ?? ''),
      deleted_at: (raw.deleted_at ?? raw.deletedAt ?? null) as string | null,
      created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    };
    set(s => ({ expenses: [...s.expenses, data] }));
  },
  updateExpense: async (id, e) => {
    const payload: any = { ...e };
    if ('date' in payload) {
      payload.expenseDate = payload.date;
      delete payload.date;
    }
    const res = await api.patch(`/expenses/${id}`, payload);
    const raw = (res && typeof res === 'object' && 'success' in res) ? (res as any).data : (res as any)?.data ?? res;
    const data: Partial<Expense> = {
      category: raw.category ?? e.category,
      amount: raw.amount ?? e.amount,
      description: raw.description ?? e.description,
      date: raw.date ?? raw.expenseDate ?? e.date,
      deleted_at: raw.deleted_at ?? raw.deletedAt,
      created_at: raw.created_at ?? raw.createdAt,
    };
    set(s => ({
      expenses: s.expenses.map(x => x.id === id ? { ...x, ...data } : x)
    }));
  },
  deleteExpense: async (id) => {
    await api.delete(`/expenses/${id}`);
    set(s => ({
      expenses: s.expenses.map(x => x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x)
    }));
  },

  addProduct: async (p) => {
    const res = await api.post('/products', p);
    const data = (res && typeof res === 'object' && 'success' in res) ? (res as any).data : (res as any)?.data ?? res;
    set(s => ({ products: [...s.products, data] }));
  },
  updateProduct: async (id, p) => {
    const res = await api.patch(`/products/${id}`, p);
    const data = (res && typeof res === 'object' && 'success' in res) ? (res as any).data : (res as any)?.data ?? res;
    set(s => ({
      products: s.products.map(x => x.id === id ? { ...x, ...data } : x)
    }));
  },
  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
    set(s => ({
      products: s.products.filter(x => x.id !== id)
    }));
  },

  addInvoice: async (inv) => {
    console.log('[dataStore] addInvoice called with items:', inv.items?.length || 0);
    console.log('[dataStore] Invoice data:', {
      customerId: inv.customerId,
      totalAmount: inv.totalAmount,
      itemsCount: inv.items?.length,
      items: inv.items?.map(i => ({ name: i.productName, qty: i.quantity, price: i.price }))
    });
    
    const res = await api.post('/invoices', inv);
    const data = (res && typeof res === 'object' && 'success' in res) ? (res as any).data : (res as any)?.data ?? res;
    
    console.log('[dataStore] Invoice created, ID:', data.id);
    
    // Map status from backend to frontend if needed
    const invoice = data;
    set(s => ({ invoices: [...s.invoices, invoice] }));
    return invoice.id;
  },
  updateInvoice: async (id, inv) => {
    console.log('[dataStore] updateInvoice called for ID:', id);
    console.log('[dataStore] Update data items:', inv.items?.length || 0);
    console.log('[dataStore] Items:', inv.items?.map(i => ({ name: i.productName, qty: i.quantity })));
    
    await api.put(`/invoices/${id}`, inv);
    
    console.log('[dataStore] Invoice updated successfully');
    
    set(s => ({
      invoices: s.invoices.map(x => x.id === id ? { ...x, ...inv } : x)
    }));
  },
  convertAdvanceToInvoice: async (id) => {
    const response = await api.put(`/invoices/${id}`, { type: 'Invoice' });
    const converted = response?.data;
    if (!converted) throw new Error('Invoice conversion returned no data');
    set(s => ({
      invoices: s.invoices.map(invoice => invoice.id === id ? { ...invoice, ...converted, type: 'Invoice' } : invoice),
    }));
  },
  deleteInvoice: async (id) => {
    await api.delete(`/invoices/${id}`);
    set(s => ({
      invoices: s.invoices.filter(x => x.id !== id)
    }));
  },
  addPayment: async (invoiceId, payment) => {
    await api.post(`/invoices/${invoiceId}/payments`, payment);
    const res = await api.get(`/invoices/${invoiceId}`);
    const data = (res && typeof res === 'object' && 'success' in res) ? (res as any).data : (res as any)?.data ?? res;
    const fullInvoice = {
      ...data.invoice,
      items: data.items,
      payments: data.payments
    };
    set(s => ({
      invoices: s.invoices.map(x => x.id === invoiceId ? fullInvoice : x)
    }));
  },
  fetchInvoice: async (id, options?: { force?: boolean }) => {
    try {
      const existing = get().invoices.find(x => x.id === id);
      // Only skip fetch when we already have line items (length check must be > 0; >= 0 was always true)
      if (
        !options?.force &&
        existing &&
        Array.isArray(existing.items) &&
        existing.items.length > 0
      ) {
        return existing;
      }

      const res = await api.get(`/invoices/${id}`);
      const invoice = res.data || res;
      // The backend returns { invoice, items, payments } for getById/getWithItems
      const itemsRaw = invoice.items || [];
      const items: InvoiceItem[] = itemsRaw.map((item: Record<string, unknown>) => ({
        ...item,
        productName: String(item.productName ?? item.product_name ?? ''),
        quantity: Number(item.quantity ?? 0),
        price: Number(item.price ?? item.unitPrice ?? item.unit_price ?? 0),
        scan: Number(item.scan ?? item.scanPrice ?? item.scan_price ?? 0),
        total: Number(item.total ?? item.totalPrice ?? item.total_price ?? 0),
      }));
      
      // Calculate actual subtotal from items
      const calculatedSubtotal = items.reduce((sum: number, item: any) => 
        sum + Number(item.totalPrice || item.total || 0), 0
      );
      
      console.log('[fetchInvoice] Items:', items.length);
      console.log('[fetchInvoice] Calculated subtotal:', calculatedSubtotal);
      console.log('[fetchInvoice] DB subtotal:', invoice.invoice?.subtotal);
      
      const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : Number(invoice.invoice?.subtotal || 0);
      const gstAmount = Number(invoice.invoice?.gstAmount || 0);
      const grandTotal = subtotal + gstAmount;
      const paidAmount = Number(invoice.invoice?.paidAmount || 0);
      
      const fullInvoice = {
        ...invoice.invoice,
        items,
        payments: invoice.payments,
        subtotal,
        gstAmount,
        grandTotal,
        totalAmount: grandTotal,
        advancePaid: paidAmount,
        paidAmount,
        balanceDue: grandTotal - paidAmount,
      };
      
      console.log('[fetchInvoice] Final totals:', {
        subtotal: fullInvoice.subtotal,
        gstAmount: fullInvoice.gstAmount,
        grandTotal: fullInvoice.grandTotal,
        paidAmount: fullInvoice.paidAmount,
        balanceDue: fullInvoice.balanceDue
      });
      
      set(s => ({
        invoices: s.invoices.some(x => x.id === id) 
          ? s.invoices.map(x => x.id === id ? fullInvoice : x)
          : [...s.invoices, fullInvoice]
      }));
      return fullInvoice;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
}));

