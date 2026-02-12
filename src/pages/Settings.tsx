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
    phone: settings.phone,
    email: settings.email,
    ownerName: settings.ownerName,
    gstPercent: settings.gstPercent,
    gstNumber: settings.gstNumber,
    taxNumber: settings.taxNumber,
    logoUrl: settings.logoUrl,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update form when settings change
  useEffect(() => {
    setForm({
      storeName: settings.storeName,
      address: settings.address,
      mobile: settings.mobile,
      phone: settings.phone,
      email: settings.email,
      ownerName: settings.ownerName,
      gstPercent: settings.gstPercent,
      gstNumber: settings.gstNumber,
      taxNumber: settings.taxNumber,
      logoUrl: settings.logoUrl,
    });
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settings.updateSettings(form);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('store_settings', settings.language)}</h1>
      <Card className="shadow-md">
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
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tax Number</Label><Input value={form.taxNumber} onChange={e => setForm({ ...form, taxNumber: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Default GST %</Label><Input type="number" value={form.gstPercent} onChange={e => setForm({ ...form, gstPercent: +e.target.value })} /></div>
            <div className="space-y-2"><Label>GST Number</Label><Input value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} /></div>
          </div>
          <div className="space-y-2">
            <Label>Store Logo</Label>
            <div className="flex items-center gap-4">
                {form.logoUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border">
                        <img src={form.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-1">
                    <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setForm({ ...form, logoUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                            }
                        }} 
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Recommended: Square image, max 1MB</p>
                </div>
                {form.logoUrl && <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, logoUrl: '' })} className="text-destructive">Remove</Button>}
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : t('save', settings.language)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
