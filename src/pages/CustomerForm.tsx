import { useState, useEffect } from 'react';
import { useDataStore, Customer } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, addCustomer, updateCustomer } = useDataStore();
  const { language } = useSettingsStore();
  
  const isEditMode = !!id;
  const existingCustomer = isEditMode ? customers.find(c => c.id === id) : null;

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    whatsapp: '',
    altContact: '',
    gender: '',
    address: '',
    notes: ''
  });
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: field === 'name' ? value.toUpperCase() : value }));
    if (field === 'name' || field === 'mobile') {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  useEffect(() => {
    if (isEditMode && existingCustomer) {
      setForm({
        name: (existingCustomer.name || '').toUpperCase(),
        mobile: existingCustomer.mobile || '',
        email: existingCustomer.email || '',
        whatsapp: existingCustomer.whatsapp || '',
        altContact: existingCustomer.altContact || '',
        gender: existingCustomer.gender || '',
        address: existingCustomer.address || '',
        notes: existingCustomer.notes || ''
      });
    }
  }, [isEditMode, existingCustomer]);

  const handleSave = async () => {
    const nextErrors = {
      name: form.name.trim() ? undefined : 'Name is required',
      mobile: form.mobile.trim() ? undefined : 'Mobile is required',
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.mobile) {
      return;
    }

    try {
      if (isEditMode && id) {
        await updateCustomer(id, form);
        toast.success('Customer updated');
      } else {
        const newId = await addCustomer(form);
        if (!newId) {
          toast.error('Customer with this mobile already exists');
          return;
        }
        toast.success('Customer added');
      }
      navigate('/customers');
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-display text-2xl font-bold">
          {isEditMode ? t('edit', language) : t('add', language)} {t('customers', language)}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('name', language)} <span className="text-destructive">*</span></Label>
              <Input 
                value={form.name} 
                onChange={e => updateField('name', e.target.value)} 
                placeholder="Full Name"
                aria-invalid={!!errors.name}
                className="bg-transparent uppercase"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('mobile', language)} <span className="text-destructive">*</span></Label>
              <Input 
                value={form.mobile} 
                onChange={e => updateField('mobile', e.target.value)} 
                placeholder="Mobile Number"
                maxLength={10}
                aria-invalid={!!errors.mobile}
                className="bg-transparent"
              />
              {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('email', language)}</Label>
              <Input 
                value={form.email} 
                onChange={e => updateField('email', e.target.value)} 
                type="email"
                placeholder="Email Address"
                className="bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input 
                value={form.whatsapp} 
                onChange={e => updateField('whatsapp', e.target.value)} 
                placeholder="WhatsApp Number"
                maxLength={10}
                className="bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alternate Contact</Label>
              <Input 
                value={form.altContact} 
                onChange={e => updateField('altContact', e.target.value)} 
                placeholder="Alt Contact Number"
                maxLength={10}
                className="bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select 
                value={form.gender} 
                onValueChange={(value) => setForm({ ...form, gender: value })}
              >
                <SelectTrigger className="bg-transparent">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          <div className="space-y-2">
            <Label>{t('address', language)}</Label>
            <Textarea 
              value={form.address} 
              onChange={e => updateField('address', e.target.value)} 
              placeholder="Full Address"
              rows={3}
              className="bg-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('notes', language)}</Label>
            <Textarea 
              value={form.notes} 
              onChange={e => updateField('notes', e.target.value)} 
              placeholder="Additional Notes"
              className="bg-transparent"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/customers')} className="rounded-[5px] border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground">
            {t('cancel', language)}
          </Button>
          <Button onClick={handleSave} className="rounded-[5px]">
            {isEditMode ? 'Update Details' : 'Save Details'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
