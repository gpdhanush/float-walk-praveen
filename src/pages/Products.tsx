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
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useDataStore();
  const { language } = useSettingsStore();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<{ name: string; price: number | ''; description: string }>({
    name: '',
    price: 0,
    description: '',
  });
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', price: 0, description: '' });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name.toUpperCase(), price: p.price, description: p.description ?? '' });
    setErrors({});
    setOpen(true);
  };

  const handleSave = async () => {
    const nextErrors = {
      name: form.name.trim() ? undefined : 'Name is required',
      price: form.price === '' ? 'Price is required' : form.price < 0 ? 'Price must be 0 or greater' : undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.price) {
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
    { key: 'sno', header: 'S.No', align: 'center' as const, width: '100px', render: (_: Product, index: number) => index + 1 },
    { key: 'name', header: t('name', language), align: 'left' as const },
    { key: 'price', header: t('price', language), render: (p: Product) => `₹${p.price.toLocaleString('en-IN')}` },
    { key: 'description', header: t('description', language) },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t("products", language)}
        </h1>
        <Button
          onClick={openNew}
          size="sm"
          className="rounded-[5px] bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
        >
          New Product
        </Button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchKeys={["name", "description"]}
        exportFileName="products"
        defaultSortKey="sno"
        actions={(p: Product) => (
          <div className="flex gap-1 justify-center">
            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setDeleteId(p.id)}
            >
              <Trash2 className="w-4 h-4" />
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
            toast.success("Deleted");
            setDeleteId(null);
          } catch (e: any) {
            console.error("Failed to delete product:", e);
            toast.error(e?.message || "Failed to delete product");
          }
        }}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!bg-white !text-slate-900 !backdrop-blur-none dark:!bg-white dark:!text-slate-900">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? t("edit", language) : t("add", language)}{" "}
              {t("products", language)}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>
                {t("name", language)}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value.toUpperCase() });
                  setErrors((current) => ({ ...current, name: undefined }));
                }}
                aria-invalid={!!errors.name}
                className="bg-white uppercase text-slate-900 placeholder:text-slate-500"
                placeholder="Product Name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                {t("price", language)}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]*"
                value={form.price}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setForm({
                    ...form,
                    price: digitsOnly === '' ? '' : Number(digitsOnly),
                  });
                  setErrors((current) => ({ ...current, price: undefined }));
                }}
                aria-invalid={!!errors.price}
                className="bg-white text-slate-900 placeholder:text-slate-500"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("description", language)}</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="bg-white text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-[5px] border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground"
            >
              {t("cancel", language)}
            </Button>
            <Button onClick={handleSave} className="rounded-[5px]">
              {editing ? "Update Details" : "Save Details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

