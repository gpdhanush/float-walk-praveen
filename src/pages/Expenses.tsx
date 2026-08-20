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
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageTitle } from '@/components/shared/PageTitle';
import { DatePicker } from '@/components/ui/date-time-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['Rent', 'Salary', 'Electricity', 'Transport', 'Materials', 'Maintenance', 'Marketing', 'Other'];

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useDataStore();
  const { language } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({ category: '', amount: 0, description: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [errors, setErrors] = useState<{ category?: string; amount?: string; date?: string }>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const active = expenses.filter(e => !e.deleted_at);

  const openNew = () => {
    setEditing(null);
    setForm({ category: '', amount: 0, description: '', date: format(new Date(), 'yyyy-MM-dd') });
    setErrors({});
    setOpen(true);
  };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({ category: e.category, amount: e.amount, description: e.description, date: e.date });
    setErrors({});
    setOpen(true);
  };

  const handleSave = async () => {
    const nextErrors = {
      category: form.category ? undefined : 'Category is required',
      amount: form.amount > 0 ? undefined : 'Amount must be greater than 0',
      date: form.date ? undefined : 'Date is required',
    };
    setErrors(nextErrors);
    if (nextErrors.category || nextErrors.amount || nextErrors.date) return;

    try {
      if (editing) {
        await updateExpense(editing.id, form);
        toast.success('Updated');
      } else {
        await addExpense(form);
        toast.success('Expense added');
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save expense');
    }
  };

  const columns = [
    { key: 'sno', header: 'S.No', align: 'center' as const, width: '150px', render: (_: Expense, index: number) => index + 1 },
    { key: 'category', header: t('category', language), align: 'left' as const },
    { key: 'amount', header: t('amount', language), align: 'right' as const, width: '150px', render: (e: Expense) => `₹${Number(e.amount || 0).toLocaleString('en-IN')}` },
    { key: 'description', header: t('description', language), align: 'left' as const },
    { 
      key: 'date', 
      header: t('date', language),
      align: 'center' as const,
      render: (e: Expense) => {
        try {
          return format(new Date(e.date), 'dd-MMM-yyyy');
        } catch {
          return e.date;
        }
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle>{t('expenses', language)}</PageTitle>
        <Button onClick={openNew} className="rounded-[5px]">Add Expense</Button>
      </div>

      <DataTable data={active} columns={columns} searchKeys={['category', 'description']} exportFileName="expenses"
        actions={(e: Expense) => (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Delete expense" onClick={() => setDeleteId(e.id)} className="text-muted-foreground hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></Button>
          </div>
        )}
      />

      <ConfirmDialog 
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteExpense(deleteId);
            toast.success('Deleted');
            setDeleteId(null);
          }
        }}
        title="Delete Expense"
        description="Are you sure you want to delete this expense record?"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? t('edit', language) : t('add', language)} Expense</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('category', language)} <span className="text-destructive">*</span></Label>
              <Select value={form.category} onValueChange={category => { setForm({ ...form, category }); setErrors(current => ({ ...current, category: undefined })); }}>
                <SelectTrigger aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('amount', language)} <span className="text-destructive">*</span></Label><Input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Enter amount" value={form.amount || ''} onChange={e => { const digits = e.target.value.replace(/\D/g, ''); setForm({ ...form, amount: digits ? Number(digits) : 0 }); setErrors(current => ({ ...current, amount: undefined })); }} aria-invalid={!!errors.amount} />{errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}</div>
              <div className="space-y-2"><Label>{t('date', language)} <span className="text-destructive">*</span></Label><DatePicker value={form.date} onChange={date => { setForm({ ...form, date }); setErrors(current => ({ ...current, date: undefined })); }} />{errors.date && <p className="text-sm text-destructive">{errors.date}</p>}</div>
            </div>
            <div className="space-y-2"><Label>{t('description', language)}</Label><Textarea placeholder="Enter description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-[5px] border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white">{t('cancel', language)}</Button>
            <Button onClick={handleSave} className="rounded-[5px]">{editing ? 'Update Details' : 'Save Details'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
