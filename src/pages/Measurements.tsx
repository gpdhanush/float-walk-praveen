import { useState } from 'react';
import { useDataStore, Measurement } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Measurements() {
  const { measurements, customers, addMeasurement } = useDataStore();
  const { language } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', leftLength: 0, leftWidth: 0, rightLength: 0, rightWidth: 0, notes: '', fileUrl: '' });

  const activeCustomers = customers.filter(c => !c.deleted_at);

  const handleSave = () => {
    if (!form.customerId) { toast.error('Select a customer'); return; }
    addMeasurement(form);
    toast.success('Measurement saved');
    setOpen(false);
    setForm({ customerId: '', leftLength: 0, leftWidth: 0, rightLength: 0, rightWidth: 0, notes: '', fileUrl: '' });
  };

  const columns = [
    { key: 'customerId', header: 'Customer', render: (m: Measurement) => customers.find(c => c.id === m.customerId)?.name || '-' },
    { key: 'leftLength', header: 'L-Length (cm)' },
    { key: 'leftWidth', header: 'L-Width (cm)' },
    { key: 'rightLength', header: 'R-Length (cm)' },
    { key: 'rightWidth', header: 'R-Width (cm)' },
    { key: 'created_at', header: t('date', language), render: (m: Measurement) => new Date(m.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('measurements', language)}</h1>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="w-4 h-4" />{t('add', language)}</Button>
      </div>

      <DataTable data={measurements} columns={columns} searchKeys={[]} exportFileName="measurements" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">New Measurement</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select value={form.customerId} onValueChange={v => setForm({ ...form, customerId: v })}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{activeCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.mobile}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Left Length (cm)</Label><Input type="number" step="0.1" value={form.leftLength} onChange={e => setForm({ ...form, leftLength: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Left Width (cm)</Label><Input type="number" step="0.1" value={form.leftWidth} onChange={e => setForm({ ...form, leftWidth: +e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Right Length (cm)</Label><Input type="number" step="0.1" value={form.rightLength} onChange={e => setForm({ ...form, rightLength: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Right Width (cm)</Label><Input type="number" step="0.1" value={form.rightWidth} onChange={e => setForm({ ...form, rightWidth: +e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t('notes', language)}</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
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
