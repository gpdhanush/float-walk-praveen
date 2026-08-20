import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Save, X, Globe, Upload, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ImageCropDialog } from '@/components/shared/ImageCropDialog';
import { WebDatePicker, WebSelect, WebTimePicker } from '@/components/web/WebFormControls';
import { uploadService } from '@/services/uploadService';
import { validateImageFile } from '@/lib/imageUtils';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { format, isValid, parse } from 'date-fns';

type Field = { key: string; label: string; type?: 'text' | 'date' | 'time' | 'number' | 'textarea' | 'select' | 'checkbox'; options?: string[]; required?: boolean; placeholder?: string };
type ResourceConfig = { title: string; description: string; fields: Field[] };
type RecordValue = string | number | boolean | null;
type WebRecord = { id: number; [key: string]: RecordValue };

const resources: Record<string, ResourceConfig> = {
  enquiries: { title: 'Contact Enquiries', description: 'Manage contact requests received from the website.', fields: [
    { key: 'name', label: 'Name', required: true }, { key: 'phone', label: 'Phone', required: true }, { key: 'email', label: 'Email', required: true }, { key: 'service', label: 'Service', type: 'select', required: true }, { key: 'preferred_date', label: 'Preferred date', type: 'date' }, { key: 'preferred_time', label: 'Preferred time', type: 'time' }, { key: 'message', label: 'Message', type: 'textarea' }, { key: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'completed', 'cancelled'] },
  ] },
  appointments: { title: 'Appointments', description: 'Review and update customer appointment requests.', fields: [
    { key: 'customer_name', label: 'Customer name', required: true }, { key: 'phone', label: 'Phone', required: true }, { key: 'service', label: 'Service', type: 'select', required: true }, { key: 'preferred_date', label: 'Preferred date', type: 'date', required: true }, { key: 'preferred_time', label: 'Preferred time', type: 'time', required: true }, { key: 'message', label: 'Message', type: 'textarea' }, { key: 'status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] }, { key: 'confirmation_method', label: 'Confirmation method', type: 'select', options: ['phone', 'whatsapp', 'both'] },
  ] },
  testimonials: { title: 'Testimonials', description: 'Publish customer testimonials on the website.', fields: [
    { key: 'customer_name', label: 'Customer name', required: true }, { key: 'rating', label: 'Rating', type: 'number', required: true }, { key: 'testimonial', label: 'Testimonial', type: 'textarea', required: true }, { key: 'service', label: 'Service', type: 'select' }, { key: 'review_date', label: 'Review date', type: 'date' }, { key: 'is_published', label: 'Published', type: 'checkbox' },
  ] },
  gallery: { title: 'Gallery Media', description: 'Manage images and social media embeds shown in the website gallery.', fields: [
    { key: 'media_id', label: 'Media ID', required: true }, { key: 'type', label: 'Type', type: 'select', options: ['image', 'instagram', 'youtube'], required: true }, { key: 'title', label: 'Title', required: true }, { key: 'caption', label: 'Caption', type: 'textarea' }, { key: 'src', label: 'Image source URL' }, { key: 'url', label: 'Media URL' }, { key: 'poster', label: 'Poster URL' }, { key: 'sort_order', label: 'Sort order', type: 'number' }, { key: 'is_active', label: 'Active', type: 'checkbox' },
  ] },
  services: { title: 'Website Services', description: 'Control the services available in the website enquiry dropdown.', fields: [
    { key: 'service_name', label: 'Service name', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'is_active', label: 'Active', type: 'checkbox' },
  ] },
};

const emptyValue = (field: Field): RecordValue => field.type === 'checkbox' ? true : field.type === 'number' ? '' : field.type === 'select' ? field.options?.[0] ?? '' : '';

const toBoolean = (value: RecordValue): boolean => value === true || value === 1 || value === '1' || value === 'true';

function FieldLabel({ field, htmlFor }: { field: Field; htmlFor: string }) {
  return <Label htmlFor={htmlFor}>{field.label}{field.required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}</Label>;
}

export default function WebManagement() {
  const { resource = 'enquiries' } = useParams();
  const config = resources[resource] ?? resources.enquiries;
  const [records, setRecords] = useState<WebRecord[]>([]);
  const [form, setForm] = useState<Record<string, RecordValue>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropSource, setCropSource] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/web-admin/${resource}?limit=200`);
      setRecords(response?.data ?? []);
    } catch (error: any) { toast.error(error.message || 'Failed to load web records'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); setEditingId(null); setForm({}); }, [resource]);

  useEffect(() => {
    api.get('/web/services?limit=200')
      .then((response) => setServiceOptions((response?.data ?? [])
        .filter((service: WebRecord) => toBoolean(service.is_active))
        .map((service: WebRecord) => String(service.service_name))))
      .catch(() => setServiceOptions([]));
  }, []);

  const handleGalleryFile = (file?: File) => {
    if (!file) return;
    const validation = validateImageFile(file, 3);
    if (!validation.valid) { toast.error(validation.error); return; }
    setCropSource(URL.createObjectURL(file));
    setCropOpen(true);
  };

  const handleGalleryCrop = async (blob: Blob) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadGallery(blob);
      setForm((current) => ({ ...current, src: result.url, type: current.type || 'image' }));
      toast.success('Image uploaded and compressed');
    } catch (error: any) { toast.error(error.message || 'Failed to upload image'); }
    finally { setUploading(false); if (cropSource) URL.revokeObjectURL(cropSource); setCropSource(''); }
  };

  const beginCreate = () => {
    setEditingId(null);
    setForm(Object.fromEntries(config.fields.map((field) => [field.key, emptyValue(field)])));
    setFormDialogOpen(true);
  };

  const beginEdit = (record: WebRecord) => {
    setEditingId(record.id);
    setForm(Object.fromEntries(config.fields.map((field) => [field.key, record[field.key] ?? emptyValue(field)])));
    setFormDialogOpen(true);
  };

  const save = async () => {
    const missingField = config.fields.find((field) => field.required && (form[field.key] == null || String(form[field.key]).trim() === ''));
    if (missingField) {
      toast.error(`${missingField.label} is required`);
      return;
    }
    if (resource === 'testimonials') {
      const rating = String(form.rating ?? '');
      if (!/^[1-5]$/.test(rating)) {
        toast.error('Rating must be a number from 1 to 5');
        return;
      }
    }
    setSaving(true);
    try {
      const endpoint = `/web-admin/${resource}${editingId ? `/${editingId}` : ''}`;
      await (editingId ? api.patch(endpoint, form) : api.post(endpoint, form));
      toast.success(editingId ? 'Record updated' : 'Record created');
      setEditingId(null); setForm({}); setFormDialogOpen(false); await load();
    } catch (error: any) { toast.error(error.message || 'Failed to save record'); }
    finally { setSaving(false); }
  };

  const remove = async (record: WebRecord) => {
    if (!window.confirm('Delete this record?')) return;
    try { await api.delete(`/web-admin/${resource}/${record.id}`); toast.success('Record deleted'); await load(); }
    catch (error: any) { toast.error(error.message || 'Failed to delete record'); }
  };

  const display = (value: RecordValue, field?: Field) => {
    if (field?.type === 'date' && value) {
      const date = parse(String(value).slice(0, 10), 'yyyy-MM-dd', new Date());
      if (isValid(date)) return format(date, 'dd-MMM-yyyy');
    }
    return typeof value === 'boolean' || value === 0 || value === 1 || value === '0' || value === '1' || value === 'true' || value === 'false' ? (toBoolean(value) ? 'Yes' : 'No') : value == null || value === '' ? '-' : String(value);
  };
  const tableColumns: Column<WebRecord>[] = config.fields.slice(0, 5).map((field) => ({
    key: field.key,
    header: field.label,
    sortable: true,
    render: (record) => <span className="block max-w-[240px] truncate">{display(record[field.key], field)}</span>,
  }));
  const filterKey = config.fields.some((field) => field.key === 'status') ? 'status' : config.fields.some((field) => field.key === 'is_active') ? 'is_active' : undefined;
  const filterOptions = filterKey === 'status'
    ? (config.fields.find((field) => field.key === 'status')?.options ?? []).map((value) => ({ label: value.replace('_', ' '), value }))
    : [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }];

  return <div className="font-web space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><div className="flex items-center gap-2 text-sm text-muted-foreground"><Globe className="h-4 w-4" /> Website</div><h1 className="text-2xl font-display font-bold mt-1">{config.title}</h1><p className="text-muted-foreground mt-1">{config.description}</p></div>
      {resource !== 'enquiries' && resource !== 'appointments' && <Button className="rounded-[5px]" onClick={beginCreate}><Plus className="h-4 w-4 mr-2" />Add record</Button>}
    </div>

    {Object.keys(form).length > 0 && resource !== 'testimonials' && <Dialog open={formDialogOpen} onOpenChange={(open) => { setFormDialogOpen(open); if (!open) { setForm({}); setEditingId(null); } }}>
      <DialogContent className="font-web max-h-[90vh] max-w-2xl overflow-y-auto rounded-[5px] p-0">
      <section className="space-y-5 p-6">
      <div className="flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit record' : 'New record'}</h2><Button variant="ghost" size="icon" onClick={() => { setForm({}); setEditingId(null); }}><X className="h-4 w-4" /></Button></div>
      <div className="grid gap-4 md:grid-cols-2">{config.fields.map((field) => <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
        {field.type === 'checkbox' ? <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={toBoolean(form[field.key])} onChange={(event) => setForm({ ...form, [field.key]: event.target.checked })} />{field.label}{field.required && <span className="text-red-500" aria-hidden="true">*</span>}</label> : <><FieldLabel field={field} htmlFor={field.key} />{field.type === 'textarea' ? <Textarea id={field.key} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} value={String(form[field.key] ?? '')} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} /> : field.type === 'select' ? <WebSelect value={String(form[field.key] ?? '')} options={field.key === 'service' && serviceOptions.length > 0 ? serviceOptions : field.options || []} placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} onChange={(value) => setForm({ ...form, [field.key]: value })} /> : field.type === 'date' ? <WebDatePicker value={String(form[field.key] ?? '')} placeholder={field.placeholder || `Pick ${field.label.toLowerCase()}`} onChange={(value) => setForm({ ...form, [field.key]: value })} /> : field.type === 'time' ? <WebTimePicker value={String(form[field.key] ?? '')} placeholder={field.placeholder || `Pick ${field.label.toLowerCase()}`} onChange={(value) => setForm({ ...form, [field.key]: value })} /> : <Input id={field.key} type="text" inputMode={field.type === 'number' ? 'numeric' : undefined} maxLength={resource === 'testimonials' && field.key === 'rating' ? 1 : undefined} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} className="rounded-[5px]" value={String(form[field.key] ?? '')} onChange={(event) => { const value = field.type === 'number' ? event.target.value.replace(/\D/g, '') : event.target.value; setForm({ ...form, [field.key]: value }); }} />}</>}
        {resource === 'gallery' && field.key === 'src' && <div className="mt-2 flex flex-wrap items-center gap-2"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { handleGalleryFile(event.target.files?.[0]); event.currentTarget.value = ''; }} /><Button type="button" variant="outline" className="rounded-[5px]" onClick={() => fileInputRef.current?.click()} disabled={uploading}><Upload className="mr-2 h-4 w-4" />{uploading ? 'Uploading...' : 'Upload image'}</Button><span className="text-xs text-muted-foreground">JPG, PNG or WEBP up to 3 MB</span>{form.src && <a href={String(form.src)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary"><ImageIcon className="h-3.5 w-3.5" />Preview</a>}</div>}
      </div>)}</div>
      <div className="flex justify-end"><Button className="rounded-[5px]" onClick={() => void save()} disabled={saving || uploading}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save record'}</Button></div>
      </section>
      </DialogContent>
    </Dialog>}

    <Dialog open={formDialogOpen && resource === 'testimonials'} onOpenChange={(open) => { setFormDialogOpen(open); if (!open) { setForm({}); setEditingId(null); } }}>
      <DialogContent className="font-web max-h-[90vh] max-w-2xl overflow-y-auto rounded-[5px] p-0">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle className="font-web text-xl">{editingId ? 'Edit testimonial' : 'Add testimonial'}</DialogTitle>
          <DialogDescription>Share a customer experience on your website.</DialogDescription>
        </DialogHeader>
        {resource === 'testimonials' && Object.keys(form).length > 0 && <div className="space-y-5 px-6 pb-6 pt-5">
          <div className="grid gap-4 md:grid-cols-2">{config.fields.map((field) => <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            {field.type === 'checkbox' ? <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={toBoolean(form[field.key])} onChange={(event) => setForm({ ...form, [field.key]: event.target.checked })} />{field.label}{field.required && <span className="text-red-500" aria-hidden="true">*</span>}</label> : <><FieldLabel field={field} htmlFor={`testimonial-${field.key}`} />{field.type === 'textarea' ? <Textarea id={`testimonial-${field.key}`} placeholder={`Enter ${field.label.toLowerCase()}`} value={String(form[field.key] ?? '')} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} /> : field.type === 'select' ? <WebSelect value={String(form[field.key] ?? '')} options={field.key === 'service' && serviceOptions.length > 0 ? serviceOptions : field.options || []} placeholder={`Select ${field.label.toLowerCase()}`} onChange={(value) => setForm({ ...form, [field.key]: value })} /> : field.type === 'date' ? <WebDatePicker value={String(form[field.key] ?? '')} placeholder={`Pick ${field.label.toLowerCase()}`} onChange={(value) => setForm({ ...form, [field.key]: value })} /> : <Input id={`testimonial-${field.key}`} type="text" inputMode={field.type === 'number' ? 'numeric' : undefined} maxLength={field.key === 'rating' ? 1 : undefined} placeholder={`Enter ${field.label.toLowerCase()}`} className="rounded-[5px]" value={String(form[field.key] ?? '')} onChange={(event) => { const value = field.type === 'number' ? event.target.value.replace(/\D/g, '') : event.target.value; setForm({ ...form, [field.key]: value }); }} />}</>}
          </div>)}</div>
          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" className="rounded-[5px]" onClick={() => setFormDialogOpen(false)}>Cancel</Button><Button className="rounded-[5px]" onClick={() => void save()} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save testimonial'}</Button></div>
        </div>}
      </DialogContent>
    </Dialog>

    <DataTable
      data={records}
      columns={tableColumns}
      searchKeys={config.fields.map((field) => field.key)}
      actions={(record) => <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="rounded-[5px]" onClick={() => beginEdit(record)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="rounded-[5px]" onClick={() => void remove(record)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>}
      filterKey={filterKey}
      filterOptions={filterOptions}
      pageSizeOptions={[10, 25, 50, 100]}
      loading={loading}
      exportFileName={`web-${resource}`}
    />
    <ImageCropDialog open={cropOpen} imageSrc={cropSource} aspect={16 / 9} cropShape="rect" onCropComplete={(blob) => void handleGalleryCrop(blob)} onClose={() => setCropOpen(false)} />
  </div>;
}