import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Purchases() {
  const { purchases, products, addPurchase } = useDataStore();
  const { language } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplier: '', productId: '', quantity: 0, costPerUnit: 0, date: format(new Date(), 'yyyy-MM-dd') });

  const activeProducts = products.filter(p => !p.deleted_at);

  const handleSave = () => {
    if (!form.supplier || !form.productId || form.quantity <= 0) {
      toast.error('Fill all required fields');
      return;
    }
    addPurchase(form);
    toast.success('Purchase added & stock updated');
    setOpen(false);
    setForm({ supplier: '', productId: '', quantity: 0, costPerUnit: 0, date: format(new Date(), 'yyyy-MM-dd') });
  };

  const columns = [
    { key: 'supplier', header: t('supplier', language) },
    { key: 'productId', header: 'Product', render: (p: any) => products.find(x => x.id === p.productId)?.name || '-' },
    { key: 'quantity', header: t('quantity', language) },
    { key: 'costPerUnit', header: 'Cost/Unit', render: (p: any) => `₹${p.costPerUnit.toLocaleString('en-IN')}` },
    { key: 'date', header: t('date', language) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('purchases', language)}</h1>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="w-4 h-4" />{t('add', language)}</Button>
      </div>

      <DataTable data={purchases} columns={columns} searchKeys={['supplier']} exportFileName="purchases" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">New Purchase</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>{t('supplier', language)} *</Label><Input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select value={form.productId} onValueChange={v => setForm({ ...form, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{activeProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('quantity', language)} *</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Cost/Unit</Label><Input type="number" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: +e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t('date', language)}</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t('cancel', language)}</Button>
            <Button onClick={handleSave}>{t('save', language)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
