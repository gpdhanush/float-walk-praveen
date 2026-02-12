import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  followUpDate: string;
  notes: string;
  deleted_at: string | null;
  created_at: string;
}

export interface Measurement {
  id: string;
  customerId: string;
  leftLength: number;
  leftWidth: number;
  rightLength: number;
  rightWidth: number;
  notes: string;
  fileUrl: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  deleted_at: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  supplier: string;
  productId: string;
  quantity: number;
  costPerUnit: number;
  date: string;
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
  productId: string;
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
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;
  status: 'paid' | 'pending' | 'partial';
  payments: PaymentRecord[];
  notes: string;
  date: string;
  created_at: string;
}

export interface StockLog {
  id: string;
  productId: string;
  type: 'purchase' | 'sale';
  quantity: number;
  date: string;
  referenceId: string;
}

interface DataState {
  customers: Customer[];
  measurements: Measurement[];
  products: Product[];
  purchases: Purchase[];
  expenses: Expense[];
  invoices: Invoice[];
  stockLogs: StockLog[];

  // Customers
  addCustomer: (c: Omit<Customer, 'id' | 'created_at' | 'deleted_at'>) => string | null;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Measurements
  addMeasurement: (m: Omit<Measurement, 'id' | 'created_at'>) => void;
  updateMeasurement: (id: string, m: Partial<Measurement>) => void;

  // Products
  addProduct: (p: Omit<Product, 'id' | 'created_at' | 'deleted_at'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Purchases
  addPurchase: (p: Omit<Purchase, 'id' | 'created_at'>) => void;

  // Expenses
  addExpense: (e: Omit<Expense, 'id' | 'created_at' | 'deleted_at'>) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Invoices
  addInvoice: (inv: Omit<Invoice, 'id' | 'created_at'>) => string;
  updateInvoice: (id: string, inv: Partial<Invoice>) => void;
  addPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => void;
}

const uid = () => crypto.randomUUID();

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      customers: [],
      measurements: [],
      products: [],
      purchases: [],
      expenses: [],
      invoices: [],
      stockLogs: [],

      addCustomer: (c) => {
        const existing = get().customers.find(x => x.mobile === c.mobile && !x.deleted_at);
        if (existing) return null;
        const id = uid();
        set(s => ({ customers: [...s.customers, { ...c, id, created_at: new Date().toISOString(), deleted_at: null }] }));
        return id;
      },
      updateCustomer: (id, c) => set(s => ({
        customers: s.customers.map(x => x.id === id ? { ...x, ...c } : x)
      })),
      deleteCustomer: (id) => set(s => ({
        customers: s.customers.map(x => x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x)
      })),

      addMeasurement: (m) => set(s => ({
        measurements: [...s.measurements, { ...m, id: uid(), created_at: new Date().toISOString() }]
      })),
      updateMeasurement: (id, m) => set(s => ({
        measurements: s.measurements.map(x => x.id === id ? { ...x, ...m } : x)
      })),

      addProduct: (p) => set(s => ({
        products: [...s.products, { ...p, id: uid(), created_at: new Date().toISOString(), deleted_at: null }]
      })),
      updateProduct: (id, p) => set(s => ({
        products: s.products.map(x => x.id === id ? { ...x, ...p } : x)
      })),
      deleteProduct: (id) => set(s => ({
        products: s.products.map(x => x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x)
      })),

      addPurchase: (p) => {
        const id = uid();
        set(s => {
          const product = s.products.find(x => x.id === p.productId);
          return {
            purchases: [...s.purchases, { ...p, id, created_at: new Date().toISOString() }],
            products: s.products.map(x => x.id === p.productId ? { ...x, stock: x.stock + p.quantity } : x),
            stockLogs: [...s.stockLogs, { id: uid(), productId: p.productId, type: 'purchase', quantity: p.quantity, date: p.date, referenceId: id }],
          };
        });
      },

      addExpense: (e) => set(s => ({
        expenses: [...s.expenses, { ...e, id: uid(), created_at: new Date().toISOString(), deleted_at: null }]
      })),
      updateExpense: (id, e) => set(s => ({
        expenses: s.expenses.map(x => x.id === id ? { ...x, ...e } : x)
      })),
      deleteExpense: (id) => set(s => ({
        expenses: s.expenses.map(x => x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x)
      })),

      addInvoice: (inv) => {
        const id = uid();
        set(s => {
          const newStockLogs: StockLog[] = [];
          const updatedProducts = [...s.products];
          inv.items.forEach(item => {
            const idx = updatedProducts.findIndex(p => p.id === item.productId);
            if (idx >= 0) {
              updatedProducts[idx] = { ...updatedProducts[idx], stock: updatedProducts[idx].stock - item.quantity };
              newStockLogs.push({ id: uid(), productId: item.productId, type: 'sale', quantity: item.quantity, date: inv.date, referenceId: id });
            }
          });
          return {
            invoices: [...s.invoices, { ...inv, id, created_at: new Date().toISOString() }],
            products: updatedProducts,
            stockLogs: [...s.stockLogs, ...newStockLogs],
          };
        });
        return id;
      },
      updateInvoice: (id, inv) => set(s => ({
        invoices: s.invoices.map(x => x.id === id ? { ...x, ...inv } : x)
      })),
      addPayment: (invoiceId, payment) => set(s => ({
        invoices: s.invoices.map(inv => {
          if (inv.id !== invoiceId) return inv;
          const newPayment = { ...payment, id: uid() };
          const payments = [...inv.payments, newPayment];
          const totalPaid = inv.advancePaid + payments.reduce((sum, p) => sum + p.amount, 0);
          const balanceDue = inv.grandTotal - totalPaid;
          const status = balanceDue <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
          return { ...inv, payments, balanceDue, status };
        })
      })),
    }),
    { name: 'data-store' }
  )
);
