import { useState, useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays } from 'date-fns';
import { DatePicker } from '@/components/ui/date-time-picker';
import { DataTable, type Column } from '@/components/shared/DataTable';

export default function Reports() {
  const { invoices, expenses } = useDataStore();
  const { language } = useSettingsStore();
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filteredInvoices = useMemo(() => invoices.filter(i => i.date >= from && i.date <= to), [invoices, from, to]);
  const filteredExpenses = useMemo(() => expenses.filter(e => !e.deleted_at && e.date >= from && e.date <= to), [expenses, from, to]);

  const totalSales = filteredInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const salesColumns: Column<(typeof filteredInvoices)[number]>[] = [
    { key: 'invoiceNumber', header: 'Invoice' },
    { key: 'customerName', header: 'Customer' },
    { key: 'grandTotal', header: 'Total', render: (invoice) => `₹${invoice.grandTotal.toLocaleString('en-IN')}` },
    { key: 'balanceDue', header: 'Balance', render: (invoice) => `₹${invoice.balanceDue.toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status' },
  ];

  const expenseColumns: Column<(typeof filteredExpenses)[number]>[] = [
    { key: 'category', header: 'Category' },
    { key: 'amount', header: 'Amount', render: (expense) => `₹${expense.amount.toLocaleString('en-IN')}` },
    { key: 'description', header: 'Description' },
    { key: 'date', header: 'Date' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('reports', language)}</h1>

      <div className="flex gap-4 items-end">
        <div className="space-y-2"><Label>From</Label><DatePicker value={from} onChange={setFrom} /></div>
        <div className="space-y-2"><Label>To</Label><DatePicker value={to} onChange={setTo} /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-md"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Sales</p><p className="text-2xl font-bold font-display text-success">₹{totalSales.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card className="shadow-md"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Expenses</p><p className="text-2xl font-bold font-display text-destructive">₹{totalExpenses.toLocaleString('en-IN')}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-4">
          <DataTable data={filteredInvoices} columns={salesColumns} searchKeys={['invoiceNumber', 'customerName', 'status']} exportFileName="sales-report" />
        </TabsContent>
        <TabsContent value="expenses" className="mt-4">
          <DataTable data={filteredExpenses} columns={expenseColumns} searchKeys={['category', 'description', 'date']} exportFileName="expenses-report" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
