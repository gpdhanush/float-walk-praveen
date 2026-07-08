import { useState } from 'react';
import { useDataStore, Product } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useDataStore();
  const { language } = useSettingsStore();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<{ name: string; price: number; description: string }>({
    name: '',
    price: 0,
    description: '',
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', price: 0, description: '' });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, description: p.description ?? '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (form.price < 0) {
      toast.error('Price must be >= 0');
      return;
    }

    try {
      if (editing) {
        await updateProduct(editing.id, {
          name: form.name.trim(),
          price: Number(form.price),
          description: form.description || null,
        });
        toast.success('Updated');
      } else {
        await addProduct({
          name: form.name.trim(),
          price: Number(form.price),
          description: form.description || null,
        });
        toast.success('Product added');
      }
      setOpen(false);
    } catch (e: any) {
      console.error('Failed to save product:', e);
      toast.error(e?.message || 'Failed to save product');
      return;
    }
  };

  const columns = [
    { key: 'name', header: t('name', language) },
    { key: 'price', header: t('price', language), render: (p: Product) => `₹${p.price.toLocaleString('en-IN')}` },
    { key: 'description', header: t('description', language) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('products', language)}</h1>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('add', language)}
        </Button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchKeys={['name', 'description']}
        exportFileName="products"
        actions={(p: Product) => (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await deleteProduct(deleteId);
            toast.success('Deleted');
            setDeleteId(null);
          } catch (e: any) {
            console.error('Failed to delete product:', e);
            toast.error(e?.message || 'Failed to delete product');
          }
        }}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? t('edit', language) : t('add', language)} {t('products', language)}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>
                {t('name', language)} *
              </Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>{t('price', language)}</Label>
              <Input
                type="number"
                value={Number(form.price) || 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('description', language)}</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel', language)}
            </Button>
            <Button onClick={handleSave}>{t('save', language)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

