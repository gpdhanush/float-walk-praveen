import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Settings() {
  const settings = useSettingsStore();
  const [form, setForm] = useState({
    storeName: settings.storeName,
    address: settings.address,
    mobile: settings.mobile,
    email: settings.email,
    ownerName: settings.ownerName,
    gstPercent: settings.gstPercent,
    gstNumber: settings.gstNumber,
  });

  const handleSave = () => {
    settings.updateSettings(form);
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('store_settings', settings.language)}</h1>
      <Card className="shadow-md max-w-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Store Name</Label><Input value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Owner Name</Label><Input value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Mobile</Label><Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Default GST %</Label><Input type="number" value={form.gstPercent} onChange={e => setForm({ ...form, gstPercent: +e.target.value })} /></div>
            <div className="space-y-2"><Label>GST Number</Label><Input value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} /></div>
          </div>
          <Button onClick={handleSave}>{t('save', settings.language)}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
