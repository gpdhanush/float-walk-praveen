import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, TrendingUp, FileText, Users, ShoppingCart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useMemo, useEffect } from 'react';

export default function Dashboard() {
  const { invoices, customers, expenses, isLoading, dataFetched, fetchData } = useDataStore();
  const { language } = useSettingsStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Ensure data is loaded
  useEffect(() => {
    if (!dataFetched && !isLoading) {
      console.log('[Dashboard] Data not fetched, fetching now...');
      fetchData();
    }
  }, [dataFetched, isLoading, fetchData]);

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

  // Revenue vs Expense pie chart - use getCreatedDate for year filter
  const pieData = useMemo(() => {
    const yearStart = startOfYear(new Date(parseInt(selectedYear), 0, 1));
    const yearEnd = endOfYear(new Date(parseInt(selectedYear), 11, 31));
    const yearInvoices = invoices.filter(inv => {
      const date = getCreatedDate(inv);
      return !isNaN(date.getTime()) && date >= yearStart && date <= yearEnd;
    });
    const yearExpenses = expenses.filter(exp => {
      const date = getCreatedDate(exp);
      return !isNaN(date.getTime()) && date >= yearStart && date <= yearEnd;
    });
    const invoiceTotal = yearInvoices.reduce((s, i) => s + Number(i.paidAmount || i.advancePaid || (i as any).totalAmount || i.grandTotal || 0), 0);
    const expenseTotal = yearExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

    const data: { name: string; value: number; color: string }[] = [];
    if (invoiceTotal > 0) data.push({ name: 'Revenue', value: invoiceTotal, color: '#0ea5e9' });
    if (expenseTotal > 0) data.push({ name: 'Expenses', value: expenseTotal, color: '#f43f5e' });
    if (data.length === 0) data.push({ name: 'No Data', value: 1, color: '#94a3b8' });
    return data;
  }, [invoices, expenses, selectedYear]);

  const PIE_COLORS = ['#0ea5e9', '#f43f5e', '#94a3b8'];

  // Show loading state
  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t('dashboard', language)}
        </h1>
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

      {/* 5 Stats Cards - 5px radius, modern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-[5px] border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
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
        <div className="rounded-[5px] border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Customers</p>
              <p className="text-xl font-bold mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="rounded-[5px] border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Invoices</p>
              <p className="text-xl font-bold mt-1">{stats.totalInvoices}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="rounded-[5px] border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Expenses</p>
              <p className="text-xl font-bold mt-1 text-red-600">₹{(Number(stats.totalExpenses) || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-red-500/10 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="rounded-[5px] border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Today&apos;s Expense</p>
              <p className="text-xl font-bold mt-1 text-amber-600">₹{(Number(stats.todayExpense) || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 rounded-[5px] bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts - 5px radius, modern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[5px] border border-border bg-card p-6 shadow-sm">
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

        <div className="rounded-[5px] border border-border bg-card p-6 shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Revenue vs Expenses ({selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pieData.length > 0 && pieData[0].name !== 'No Data' ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '5px' }}
                    formatter={(value: number) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No data available for {selectedYear}
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
}
