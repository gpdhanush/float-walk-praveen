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

export interface InvoiceItem {
  productName: string;
  quantity: number;
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
  advancePaid: number;
  balanceDue: number;
  status: 'paid' | 'pending' | 'partial' | 'hold';
  payments: PaymentRecord[];
  notes: string;
  date: string;
  type?: 'Invoice' | 'Quotation' | 'Advance Payment';
  created_at: string;
}

interface DataState {
  customers: Customer[];
  expenses: Expense[];
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

  // Invoices
  addInvoice: (inv: Omit<Invoice, 'id' | 'created_at' | 'invoiceNumber'> & { invoiceNumber?: string }) => Promise<string>;
  updateInvoice: (id: string, inv: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  fetchInvoice: (id: string) => Promise<Invoice | null>;
  addPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  customers: [],
  expenses: [],
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
      const [customersRes, invoicesRes, expensesRes] = await Promise.all([
        api.get('/customers?limit=100').then(async (res) => {
          // await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
          return res;
        }),
        api.get('/invoices?limit=100'),
        api.get('/expenses?limit=100'),
      ]);
      
      console.log('✅ Data fetched successfully', {
        customers: customersRes.data?.length || 0,
        invoices: invoicesRes.data?.length || 0,
        expenses: expensesRes.data?.length || 0,
      });
      
      set({ 
        customers: customersRes.data || [], 
        invoices: invoicesRes.data || [],
        expenses: expensesRes.data || [],
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
      const data = res.data?.data || res.data || res;
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
    const res = await api.post('/expenses', e);
    const data = res.data?.data || res.data || res;
    set(s => ({ expenses: [...s.expenses, data] }));
  },
  updateExpense: async (id, e) => {
    await api.patch(`/expenses/${id}`, e);
    set(s => ({
      expenses: s.expenses.map(x => x.id === id ? { ...x, ...e } : x)
    }));
  },
  deleteExpense: async (id) => {
    await api.delete(`/expenses/${id}`);
    set(s => ({
      expenses: s.expenses.map(x => x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x)
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
    const data = res.data?.data || res.data || res;
    
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
  deleteInvoice: async (id) => {
    await api.delete(`/invoices/${id}`);
    set(s => ({
      invoices: s.invoices.filter(x => x.id !== id)
    }));
  },
  addPayment: async (invoiceId, payment) => {
    await api.post(`/invoices/${invoiceId}/payments`, payment);
    const res = await api.get(`/invoices/${invoiceId}`);
    const data = res.data?.data || res.data || res;
    const fullInvoice = {
      ...data.invoice,
      items: data.items,
      payments: data.payments
    };
    set(s => ({
      invoices: s.invoices.map(x => x.id === invoiceId ? fullInvoice : x)
    }));
  },
  fetchInvoice: async (id) => {
    try {
      // Check if invoice already exists with items
      const existing = get().invoices.find(x => x.id === id);
      if (existing && existing.items && existing.items.length >= 0) {
        return existing;
      }

      const res = await api.get(`/invoices/${id}`);
      const invoice = res.data || res;
      // The backend returns { invoice, items, payments } for getById/getWithItems
      // We need to merge them into the Invoice interface the frontend uses
      const items = invoice.items || [];
      
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

