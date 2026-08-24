import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, TrendingUp, FileText, Users, ShoppingCart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useMemo, useEffect } from 'react';
import { api } from '@/services/api';
import { ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '../components/ui/sonner';
import { PageTitle } from '@/components/shared/PageTitle';

type StoreStatus = { closed: boolean; reason: string };

export default function Dashboard() {
  const { invoices, customers, expenses, isLoading, dataFetched, fetchData } = useDataStore();
  const { language } = useSettingsStore();
  const user = useAuthStore((state) => state.user);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [savingStoreStatus, setSavingStoreStatus] = useState(false);

  // Ensure data is loaded
  useEffect(() => {
    if (!dataFetched && !isLoading) {
      console.log('[Dashboard] Data not fetched, fetching now...');
      fetchData();
    }
  }, [dataFetched, isLoading, fetchData]);

  useEffect(() => {
    api.get('/web-settings/status')
      .then((response) => setStoreStatus(response?.data ?? null))
      .catch(() => setStoreStatus(null));
  }, []);

  const toggleStoreStatus = async (closed: boolean) => {
    if (!storeStatus || savingStoreStatus) return;
    const previousStatus = storeStatus;
    setStoreStatus({ ...storeStatus, closed });
    setSavingStoreStatus(true);
    try {
      const response = await api.patch('/web-settings/status', { ...storeStatus, closed });
      setStoreStatus(response?.data ?? { ...storeStatus, closed });
      toast.success(closed ? 'Store closed' : 'Store opened');
    } catch (error: any) {
      setStoreStatus(previousStatus);
      toast.error(error.message || 'Failed to update store status');
    } finally {
      setSavingStoreStatus(false);
    }
  };

  // API may return createdAt (camelCase) or created_at (snake_case)
  const getCreatedDate = (obj: { created_at?: string; createdAt?: string; date?: string }) =>
    new Date((obj as any).created_at || (obj as any).createdAt || obj.date || '');

  // Get available years from invoices and customers
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    invoices.forEach(inv => {
      const date = getCreatedDate(inv);
      if (!isNaN(date.getTime())) years.add(date.getFullYear());
    });
    customers.forEach(cust => {
      const date = getCreatedDate(cust);
      if (!isNaN(date.getTime())) years.add(date.getFullYear());
    });
    const yearArray = Array.from(years).sort((a, b) => b - a);
    return yearArray.length > 0 ? yearArray : [new Date().getFullYear()];
  }, [invoices, customers]);

  // Calculate stats
  const stats = useMemo(() => {
    const yearStart = startOfYear(new Date(parseInt(selectedYear), 0, 1));
    const yearEnd = endOfYear(new Date(parseInt(selectedYear), 11, 31));

    const yearInvoices = invoices.filter(inv => {
      const date = getCreatedDate(inv);
      return !isNaN(date.getTime()) && date >= yearStart && date <= yearEnd;
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    const yearExpenses = expenses.filter(exp => {
      const date = getCreatedDate(exp);
      return !isNaN(date.getTime()) && date >= yearStart && date <= yearEnd;
    });
    const todayExpenses = expenses.filter(exp => {
      const d = exp.date || (exp as any).created_at || (exp as any).createdAt || '';
      return format(new Date(d), 'yyyy-MM-dd') === today;
    });
    const todayExpenseTotal = todayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

    const totalRevenue = yearInvoices.reduce((s, i) => s + Number((i as any).totalAmount ?? i.grandTotal ?? 0), 0);
    const totalExpenses = yearExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

    return {
      totalRevenue,
      totalInvoices: yearInvoices.length,
      totalCustomers: customers.length,
      totalExpenses,
      todayExpense: todayExpenseTotal,
    };
  }, [invoices, customers, expenses, selectedYear]);

  // Customer growth data (month-wise) - use getCreatedDate so API createdAt/created_at both work
  const customerGrowthData = useMemo(() => {
    const monthData: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => { monthData[m] = 0; });

    customers.forEach(cust => {
      const date = getCreatedDate(cust);
      if (!isNaN(date.getTime()) && date.getFullYear() === parseInt(selectedYear)) {
        const monthName = months[date.getMonth()];
        monthData[monthName] = (monthData[monthName] || 0) + 1;
      }
    });

    return months.map(month => ({ month, customers: monthData[month] || 0 }));
  }, [customers, selectedYear]);

  // Revenue vs expenses by month for the selected year.
  const revenueExpenseData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month) => ({ month, revenue: 0, expenses: 0 }));
    const year = parseInt(selectedYear);

    invoices.forEach((invoice) => {
      const date = getCreatedDate(invoice);
      if (date.getFullYear() === year && !isNaN(date.getTime())) {
        monthlyData[date.getMonth()].revenue += Number((invoice as any).totalAmount ?? invoice.grandTotal ?? 0);
      }
    });

    expenses.forEach((expense) => {
      const date = getCreatedDate(expense);
      if (date.getFullYear() === year && !isNaN(date.getTime())) {
        monthlyData[date.getMonth()].expenses += Number(expense.amount || 0);
      }
    });

    return monthlyData;
  }, [invoices, expenses, selectedYear]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageTitle>
          {t('dashboard', language)}
        </PageTitle>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px] rounded-[5px] border border-border">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {storeStatus && <section className={storeStatus.closed ? 'overflow-hidden rounded-[5px] border border-red-200 bg-red-50 shadow-sm dark:border-red-900/50 dark:bg-red-950/20' : 'rounded-[5px] border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20'}>
        <div className="flex flex-wrap items-center justify-between gap-5 p-5">
          <div className="flex items-center gap-4">
            {storeStatus.closed && <img src="/closed.png" alt="Store closed" className="h-20 w-24 object-contain" />}
            <div><p className={storeStatus.closed ? 'text-xl font-bold text-red-700 dark:text-red-300' : 'text-xl font-bold text-emerald-700 dark:text-emerald-300'}>{storeStatus.closed ? 'Store is currently closed' : 'Store is open'}</p><p className={storeStatus.closed ? 'mt-1 text-sm text-red-800/80 dark:text-red-200/80' : 'mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80'}>{storeStatus.closed ? (storeStatus.reason || 'The store is temporarily closed.') : 'The store is accepting customers.'}</p></div>
          </div>
          {user?.role === 'admin' && <div className="flex items-center gap-4"><label className="text-sm font-medium">{storeStatus.closed ? 'Closed' : 'Open'}</label><Switch checked={storeStatus.closed} onCheckedChange={(closed) => void toggleStoreStatus(closed)} disabled={savingStoreStatus} aria-label="Toggle store open or closed" /><a href="/web-settings/store-status" className="inline-flex items-center justify-center gap-2 rounded-[5px] border border-current/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"><span className="hidden sm:inline">Settings</span><ExternalLink className="h-4 w-4" /></a></div>}
        </div>
      </section>}

      {/* 5 Stats Cards - 5px radius, modern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card border-green-600/70 bg-cyan-50/50 p-5 transition-shadow hover:shadow-lg dark:border-cyan-800 dark:bg-cyan-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
              <p className="text-xl font-bold mt-1 text-green-600">₹{(Number(stats.totalRevenue) || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-green-500/10 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="glass-card border-cyan-600/70 bg-emerald-50/50 p-5 transition-shadow hover:shadow-lg dark:border-emerald-800 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Customers</p>
              <p className="text-xl font-bold mt-1 text-cyan-600 dark:text-cyan-300">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-300" />
            </div>
          </div>
        </div>
        <div className="glass-card border-violet-300/70 bg-violet-50/50 p-5 transition-shadow hover:shadow-lg dark:border-violet-800 dark:bg-violet-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Invoices</p>
              <p className="text-xl font-bold mt-1 text-violet-600 dark:text-violet-300">{stats.totalInvoices}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-violet-500/10 dark:bg-violet-400/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-violet-600 dark:text-violet-300" />
            </div>
          </div>
        </div>
        <div className="glass-card border-sky-600/70 bg-sky-50/50 p-5 transition-shadow hover:shadow-lg dark:border-sky-300 dark:bg-sky-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Expenses</p>
              <p className="text-xl font-bold mt-1 text-sky-600 dark:text-sky-300">₹{(Number(stats.totalExpenses) || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-sky-500/10 dark:bg-sky-400/10 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-sky-600 dark:text-sky-300" />
            </div>
          </div>
        </div>
        <div className="glass-card border-blue-600/70 bg-blue-50/50 p-5 transition-shadow hover:shadow-lg dark:border-blue-300 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Today&apos;s Expense</p>
              <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-300">₹{(Number(stats.todayExpense) || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts - 5px radius, modern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card border-sky-300/70 bg-sky-50/30 p-6 dark:border-sky-800 dark:bg-sky-950/15">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Customer Growth ({selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={customerGrowthData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '5px' }}
                  cursor={{ stroke: 'hsl(var(--border))' }}
                />
                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 5 }}
                  fill="url(#colorCustomers)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </div>

        <div className="glass-card border-rose-300/70 bg-rose-50/30 p-6 dark:border-rose-800 dark:bg-rose-950/15">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Revenue vs Expenses ({selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueExpenseData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <linearGradient id="expenseLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" opacity={0.45} vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={48} tickFormatter={(value) => `₹${Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', boxShadow: '0 10px 25px -12px rgba(15, 23, 42, 0.35)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: number, name: string) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'revenue' ? 'Revenue' : 'Expenses']}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeDasharray: '4 4' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} formatter={(value) => value === 'revenue' ? 'Revenue' : 'Expenses'} />
                <Line type="monotone" dataKey="revenue" stroke="url(#revenueLine)" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="expenses" stroke="url(#expenseLine)" strokeWidth={3} dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
