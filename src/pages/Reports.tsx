import { useState, useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays } from 'date-fns';
import { DatePicker } from '@/components/ui/date-time-picker';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { PageTitle } from '@/components/shared/PageTitle';
import { Badge } from '@/components/ui/badge';
import { CalendarRange, Receipt, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';

export default function Reports() {
  const { invoices, expenses } = useDataStore();
  const { language } = useSettingsStore();
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filteredInvoices = useMemo(() => invoices.filter(i => i.date >= from && i.date <= to), [invoices, from, to]);
  const filteredExpenses = useMemo(() => expenses.filter(e => !e.deleted_at && e.date >= from && e.date <= to), [expenses, from, to]);

  const totalSales = filteredInvoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const netTotal = totalSales - totalExpenses;

  const salesColumns: Column<(typeof filteredInvoices)[number]>[] = [
    { key: 'sno', header: 'S.No', align: 'center', width: '90px', render: (_, index) => index + 1 },
    { key: 'invoiceNumber', header: 'Invoice', align: 'left' },
    { key: 'customerName', header: 'Customer', align: 'left' },
    { key: 'grandTotal', header: 'Total', align: 'right', render: (invoice) => `₹${Number(invoice.grandTotal || 0).toLocaleString('en-IN')}` },
    { key: 'balanceDue', header: 'Balance', align: 'right', render: (invoice) => `₹${Number(invoice.balanceDue || 0).toLocaleString('en-IN')}` },
    {
      key: 'status',
      header: 'Status',
      render: (invoice) => {
        const status = invoice.status || 'pending';
        const statusClass = status === 'paid'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
          : status === 'partial'
            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
            : status === 'hold'
              ? 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
        return <Badge variant="outline" className={`rounded-[5px] px-2 py-0.5 text-[11px] font-semibold uppercase ${statusClass}`}>{status}</Badge>;
      },
    },
  ];

  const expenseColumns: Column<(typeof filteredExpenses)[number]>[] = [
    { key: 'sno', header: 'S.No', align: 'center', width: '90px', render: (_, index) => index + 1 },
    { key: 'category', header: 'Category', align: 'left' },
    { key: 'amount', header: 'Amount', align: 'right', render: (expense) => `₹${Number(expense.amount || 0).toLocaleString('en-IN')}` },
    { key: 'description', header: 'Description', align: 'left' },
    {
      key: 'date',
      header: 'Date',
      align: 'center',
      render: (expense) => {
        const date = new Date(expense.date);
        return Number.isNaN(date.getTime()) ? expense.date : format(date, 'dd-MMM-yyyy');
      },
    },
  ];

  return (
    <div className="font-sans space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <PageTitle>{t('reports', language)}</PageTitle>
          <p className="mt-2 text-sm text-muted-foreground">Review sales performance and operating expenses for a selected period.</p>
        </div>
        <Card className="border-primary/10 bg-primary/[0.03] shadow-none">
          <CardContent className="flex items-center gap-3 p-3">
            <div className="rounded-[5px] bg-primary p-2 text-primary-foreground"><CalendarRange className="h-4 w-4" /></div>
            <div className="text-xs"><p className="font-semibold text-foreground">Reporting period</p><p className="text-muted-foreground">{format(new Date(from), 'dd MMM yyyy')} - {format(new Date(to), 'dd MMM yyyy')}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[10px] border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/70 px-5 py-4 sm:px-6">
          <CardTitle className="text-base">Filter reports</CardTitle>
          <CardDescription>Choose the dates used in the totals and tables below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:px-6">
          <div className="w-full space-y-2 sm:max-w-[220px]"><Label>From</Label><DatePicker value={from} onChange={setFrom} /></div>
          <div className="w-full space-y-2 sm:max-w-[220px]"><Label>To</Label><DatePicker value={to} onChange={setTo} /></div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[10px] border-emerald-200/70 bg-emerald-50/50 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-muted-foreground">Sales</p><p className="mt-1 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-400">₹{totalSales.toLocaleString('en-IN')}</p></div><div className="rounded-[5px] bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"><TrendingUp className="h-5 w-5" /></div></CardContent></Card>
        <Card className="rounded-[10px] border-rose-200/70 bg-rose-50/50 shadow-sm dark:border-rose-900 dark:bg-rose-950/20"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-muted-foreground">Expenses</p><p className="mt-1 font-display text-2xl font-bold text-rose-700 dark:text-rose-400">₹{totalExpenses.toLocaleString('en-IN')}</p></div><div className="rounded-[5px] bg-rose-100 p-3 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"><TrendingDown className="h-5 w-5" /></div></CardContent></Card>
        <Card className="rounded-[10px] border-sky-200/70 bg-sky-50/50 shadow-sm dark:border-sky-900 dark:bg-sky-950/20"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-muted-foreground">Net balance</p><p className={`mt-1 font-display text-2xl font-bold ${netTotal >= 0 ? 'text-sky-700 dark:text-sky-400' : 'text-rose-700 dark:text-rose-400'}`}>₹{netTotal.toLocaleString('en-IN')}</p></div><div className="rounded-[5px] bg-sky-100 p-3 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"><WalletCards className="h-5 w-5" /></div></CardContent></Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-[8px] border border-border bg-muted/60 p-1 sm:w-fit">
          <TabsTrigger value="sales" className="gap-2 rounded-[5px] px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm"><Receipt className="h-4 w-4" />Sales<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white">{filteredInvoices.length}</span></TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2 rounded-[5px] px-4 py-2 data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-sm"><TrendingDown className="h-4 w-4" />Expenses<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground data-[state=active]:bg-rose-500 data-[state=active]:text-white">{filteredExpenses.length}</span></TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-0"><Card className="rounded-[10px] border-border/80 shadow-sm"><CardHeader className="border-b border-border/70 px-5 py-4 sm:px-6"><CardTitle className="text-base">Sales transactions</CardTitle><CardDescription>Invoices recorded in the selected reporting period.</CardDescription></CardHeader><CardContent className="p-5 sm:px-6"><DataTable data={filteredInvoices} columns={salesColumns} searchKeys={['invoiceNumber', 'customerName', 'status']} exportFileName="sales-report" /></CardContent></Card></TabsContent>
        <TabsContent value="expenses" className="mt-0"><Card className="rounded-[10px] border-border/80 shadow-sm"><CardHeader className="border-b border-border/70 px-5 py-4 sm:px-6"><CardTitle className="text-base">Operating expenses</CardTitle><CardDescription>Expense records recorded in the selected reporting period.</CardDescription></CardHeader><CardContent className="p-5 sm:px-6"><DataTable data={filteredExpenses} columns={expenseColumns} searchKeys={['category', 'description', 'date']} exportFileName="expenses-report" /></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
