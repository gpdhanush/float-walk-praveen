import { useState } from 'react';
import { useDataStore, Customer } from '@/stores/dataStore';
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

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useDataStore();
  const { language } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', address: '', followUpDate: '', notes: '' });

  const activeCustomers = customers.filter(c => !c.deleted_at);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', mobile: '', email: '', address: '', followUpDate: '', notes: '' });
    setOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, mobile: c.mobile, email: c.email, address: c.address, followUpDate: c.followUpDate, notes: c.notes });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.mobile) {
      toast.error('Name and Mobile are required');
      return;
    }
    if (editing) {
      updateCustomer(editing.id, form);
      toast.success('Customer updated');
    } else {
      const id = addCustomer(form);
      if (!id) {
        toast.error('Customer with this mobile already exists');
        return;
      }
      toast.success('Customer added');
    }
    setOpen(false);
  };

  const columns = [
    { key: 'name', header: t('name', language) },
    { key: 'mobile', header: t('mobile', language) },
    { key: 'email', header: t('email', language) },
    { key: 'address', header: t('address', language) },
    { key: 'followUpDate', header: t('follow_up', language) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('customers', language)}</h1>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('new_customer', language)}
        </Button>
      </div>

      <DataTable
        data={activeCustomers}
        columns={columns}
        searchKeys={['name', 'mobile', 'email']}
        exportFileName="customers"
        actions={(c: Customer) => (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { deleteCustomer(c.id); toast.success('Customer deleted'); }}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? t('edit', language) : t('add', language)} {t('customers', language)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('name', language)} *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('mobile', language)} *</Label>
                <Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('email', language)}</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('follow_up', language)}</Label>
                <Input type="date" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('address', language)}</Label>
              <Textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('notes', language)}</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
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
