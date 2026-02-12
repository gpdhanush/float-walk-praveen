import { useState } from 'react';
import { useDataStore, Product } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useDataStore();
  const { language } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', stock: 0, price: 0, lowStockThreshold: 5 });

  const activeProducts = products.filter(p => !p.deleted_at);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', sku: '', stock: 0, price: 0, lowStockThreshold: 5 });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, stock: p.stock, price: p.price, lowStockThreshold: p.lowStockThreshold });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.sku) {
      toast.error('Name and SKU are required');
      return;
    }
    if (editing) {
      updateProduct(editing.id, form);
      toast.success('Product updated');
    } else {
      addProduct(form);
      toast.success('Product added');
    }
    setOpen(false);
  };

  const columns = [
    { key: 'name', header: t('name', language) },
    { key: 'sku', header: t('sku', language) },
    { key: 'price', header: t('price', language), render: (p: Product) => `₹${p.price.toLocaleString('en-IN')}` },
    {
      key: 'stock', header: t('stock', language), render: (p: Product) => (
        <div className="flex items-center gap-2">
          <span>{p.stock}</span>
          {p.stock <= p.lowStockThreshold && <Badge variant="destructive" className="text-xs">{t('low_stock', language)}</Badge>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('products', language)}</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />{t('add', language)}</Button>
      </div>

      <DataTable
        data={activeProducts}
        columns={columns}
        searchKeys={['name', 'sku']}
        exportFileName="products"
        actions={(p: Product) => (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { deleteProduct(p.id); toast.success('Deleted'); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? t('edit', language) : t('add', language)} Product</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('name', language)} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('sku', language)} *</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{t('price', language)}</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('stock', language)}</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Low Stock Alert</Label><Input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: +e.target.value })} /></div>
            </div>
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
