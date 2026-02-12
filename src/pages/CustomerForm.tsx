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

  useEffect(() => {
    if (isEditMode && existingCustomer) {
      setForm({
        name: existingCustomer.name || '',
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
    if (!form.name || !form.mobile) {
      toast.error('Name and Mobile are required');
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
              <Label>{t('name', language)} *</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('mobile', language)} *</Label>
              <Input 
                value={form.mobile} 
                onChange={e => setForm({ ...form, mobile: e.target.value })} 
                placeholder="Mobile Number"
                maxLength={10}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('email', language)}</Label>
              <Input 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
                type="email"
                placeholder="Email Address"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input 
                value={form.whatsapp} 
                onChange={e => setForm({ ...form, whatsapp: e.target.value })} 
                placeholder="WhatsApp Number"
                maxLength={10}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alternate Contact</Label>
              <Input 
                value={form.altContact} 
                onChange={e => setForm({ ...form, altContact: e.target.value })} 
                placeholder="Alt Contact Number"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select 
                value={form.gender} 
                onValueChange={(value) => setForm({ ...form, gender: value })}
              >
                <SelectTrigger>
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
              onChange={e => setForm({ ...form, address: e.target.value })} 
              placeholder="Full Address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('notes', language)}</Label>
            <Textarea 
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })} 
              placeholder="Additional Notes"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            {t('cancel', language)}
          </Button>
          <Button onClick={handleSave}>
            {t('save', language)}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
