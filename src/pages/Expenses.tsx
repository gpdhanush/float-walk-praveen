import { useState } from 'react';
import { useDataStore, Expense } from '@/stores/dataStore';
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
import { format } from 'date-fns';

const CATEGORIES = ['Rent', 'Salary', 'Electricity', 'Transport', 'Materials', 'Maintenance', 'Marketing', 'Other'];

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useDataStore();
  const { language } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({ category: '', amount: 0, description: '', date: format(new Date(), 'yyyy-MM-dd') });

  const active = expenses.filter(e => !e.deleted_at);

  const openNew = () => { setEditing(null); setForm({ category: '', amount: 0, description: '', date: format(new Date(), 'yyyy-MM-dd') }); setOpen(true); };
  const openEdit = (e: Expense) => { setEditing(e); setForm({ category: e.category, amount: e.amount, description: e.description, date: e.date }); setOpen(true); };

  const handleSave = () => {
    if (!form.category || form.amount <= 0) { toast.error('Category and Amount required'); return; }
    if (editing) { updateExpense(editing.id, form); toast.success('Updated'); }
    else { addExpense(form); toast.success('Expense added'); }
    setOpen(false);
  };

  const columns = [
    { key: 'category', header: t('category', language) },
    { key: 'amount', header: t('amount', language), render: (e: Expense) => `₹${e.amount.toLocaleString('en-IN')}` },
    { key: 'description', header: t('description', language) },
    { key: 'date', header: t('date', language) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('expenses', language)}</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />{t('add', language)}</Button>
      </div>

      <DataTable data={active} columns={columns} searchKeys={['category', 'description']} exportFileName="expenses"
        actions={(e: Expense) => (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { deleteExpense(e.id); toast.success('Deleted'); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? t('edit', language) : t('add', language)} Expense</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('category', language)} *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('amount', language)} *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('date', language)}</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t('description', language)}</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
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
