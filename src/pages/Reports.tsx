import { useState, useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format, subDays } from 'date-fns';

export default function Reports() {
  const { invoices, expenses, purchases } = useDataStore();
  const { language } = useSettingsStore();
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filteredInvoices = useMemo(() => invoices.filter(i => i.date >= from && i.date <= to), [invoices, from, to]);
  const filteredExpenses = useMemo(() => expenses.filter(e => !e.deleted_at && e.date >= from && e.date <= to), [expenses, from, to]);
  const filteredPurchases = useMemo(() => purchases.filter(p => p.date >= from && p.date <= to), [purchases, from, to]);

  const totalSales = filteredInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPurchases = filteredPurchases.reduce((s, p) => s + (p.quantity * p.costPerUnit), 0);

  const exportData = (data: any[], name: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `${name}-report.xlsx`);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('reports', language)}</h1>

      <div className="flex gap-4 items-end">
        <div className="space-y-2"><Label>From</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
        <div className="space-y-2"><Label>To</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-md"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Sales</p><p className="text-2xl font-bold font-display text-success">₹{totalSales.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card className="shadow-md"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Expenses</p><p className="text-2xl font-bold font-display text-destructive">₹{totalExpenses.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card className="shadow-md"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Purchases</p><p className="text-2xl font-bold font-display text-info">₹{totalPurchases.toLocaleString('en-IN')}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-4">
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" onClick={() => exportData(filteredInvoices.map(i => ({ Invoice: i.invoiceNumber, Customer: i.customerName, Total: i.grandTotal, Balance: i.balanceDue, Status: i.status, Date: i.date })), 'sales')} className="gap-2"><Download className="w-4 h-4" />Export</Button>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/50 text-left"><th className="p-3">Invoice</th><th className="p-3">Customer</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Balance</th><th className="p-3">Status</th></tr></thead>
              <tbody>{filteredInvoices.map(i => <tr key={i.id} className="border-t"><td className="p-3">{i.invoiceNumber}</td><td className="p-3">{i.customerName}</td><td className="p-3 text-right">₹{i.grandTotal.toLocaleString('en-IN')}</td><td className="p-3 text-right">₹{i.balanceDue.toLocaleString('en-IN')}</td><td className="p-3">{i.status}</td></tr>)}</tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="expenses" className="mt-4">
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" onClick={() => exportData(filteredExpenses.map(e => ({ Category: e.category, Amount: e.amount, Description: e.description, Date: e.date })), 'expenses')} className="gap-2"><Download className="w-4 h-4" />Export</Button>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/50 text-left"><th className="p-3">Category</th><th className="p-3 text-right">Amount</th><th className="p-3">Description</th><th className="p-3">Date</th></tr></thead>
              <tbody>{filteredExpenses.map(e => <tr key={e.id} className="border-t"><td className="p-3">{e.category}</td><td className="p-3 text-right">₹{e.amount.toLocaleString('en-IN')}</td><td className="p-3">{e.description}</td><td className="p-3">{e.date}</td></tr>)}</tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="purchases" className="mt-4">
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" onClick={() => exportData(filteredPurchases.map(p => ({ Supplier: p.supplier, Qty: p.quantity, Cost: p.costPerUnit, Total: p.quantity * p.costPerUnit, Date: p.date })), 'purchases')} className="gap-2"><Download className="w-4 h-4" />Export</Button>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/50 text-left"><th className="p-3">Supplier</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Cost</th><th className="p-3 text-right">Total</th><th className="p-3">Date</th></tr></thead>
              <tbody>{filteredPurchases.map(p => <tr key={p.id} className="border-t"><td className="p-3">{p.supplier}</td><td className="p-3 text-right">{p.quantity}</td><td className="p-3 text-right">₹{p.costPerUnit.toLocaleString('en-IN')}</td><td className="p-3 text-right">₹{(p.quantity * p.costPerUnit).toLocaleString('en-IN')}</td><td className="p-3">{p.date}</td></tr>)}</tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
