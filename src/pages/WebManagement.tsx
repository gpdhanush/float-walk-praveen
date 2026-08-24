import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '../components/ui/sonner';
import { ImageCropDialog } from '@/components/shared/ImageCropDialog';
import { WebDatePicker, WebSelect, WebTimePicker } from '@/components/web/WebFormControls';
import { uploadService } from '@/services/uploadService';
import { validateImageFile } from '@/lib/imageUtils';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { format, isValid, parse, parseISO } from 'date-fns';
import { PageTitle } from '@/components/shared/PageTitle';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { getLogoUrl } from '@/lib/utils/logoUtils';

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

const normalizeDateValue = (value: RecordValue): RecordValue => {
  if (!value) return value;
  const rawValue = String(value).trim();
  const parsed = /^\d{4}-\d{2}-\d{2}/.test(rawValue)
    ? parse(rawValue.slice(0, 10), 'yyyy-MM-dd', new Date())
    : parseISO(rawValue);
  return isValid(parsed) ? format(parsed, 'yyyy-MM-dd') : value;
};

const formatTimeValue = (value: RecordValue): string => {
  if (!value) return '-';
  const rawValue = String(value);
  const parsed = parse(rawValue.slice(0, 5), 'HH:mm', new Date());
  return isValid(parsed) ? format(parsed, 'hh:mm a').toUpperCase() : rawValue;
};

const titleCase = (value: RecordValue): string => String(value ?? '').replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

const galleryMediaPrefix = (type: string): string => type === 'instagram' ? 'INS' : type === 'youtube' ? 'YTB' : 'IMG';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteRecord, setDeleteRecord] = useState<WebRecord | null>(null);
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
    setFormErrors({});
    const nextForm = Object.fromEntries(config.fields.map((field) => [field.key, field.key === 'confirmation_method' ? 'both' : emptyValue(field)]));
    if (resource === 'gallery') {
      const prefix = galleryMediaPrefix(String(nextForm.type || 'image'));
      const nextNumber = records.filter((record) => String(record.media_id || '').startsWith(`${prefix}-`)).length + 1;
      nextForm.media_id = `${prefix}-${String(nextNumber).padStart(3, '0')}`;
    }
    setForm(nextForm);
    setFormDialogOpen(true);
  };

  const beginEdit = (record: WebRecord) => {
    setEditingId(record.id);
    setFormErrors({});
    setForm(Object.fromEntries(config.fields.map((field) => [field.key, field.type === 'checkbox' ? toBoolean(record[field.key]) : field.type === 'date' ? normalizeDateValue(record[field.key]) : field.key === 'confirmation_method' ? 'both' : field.key === 'customer_name' && resource === 'testimonials' ? String(record[field.key] ?? '').toUpperCase() : record[field.key] ?? emptyValue(field)])));
    setFormDialogOpen(true);
  };

  const validateField = (field: Field, value: RecordValue): string => {
    const text = String(value ?? '').trim();
    if (field.required && !text) return `${field.label} is required`;
    if (field.key === 'email' && text && !/^\S+@\S+\.\S+$/.test(text)) return 'Enter a valid email address';
    if (field.key === 'phone' && text && !/^\d{10}$/.test(text)) return 'Phone number must be exactly 10 digits';
    if (field.type === 'date' && text) {
      const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(text) ? parse(text, 'yyyy-MM-dd', new Date()) : parseISO(text);
      if (!parsedDate || !isValid(parsedDate)) return 'Choose a valid date';
    }
    if (resource === 'testimonials' && field.key === 'rating' && text && !/^[1-5]$/.test(text)) return 'Rating must be a number from 1 to 5';
    if (resource === 'gallery' && field.key === 'src' && String(form.type || 'image') === 'image' && !text) return 'Upload an image';
    if (resource === 'gallery' && field.key === 'url' && String(form.type) !== 'image' && !text) return 'Media URL is required';
    return '';
  };

  const updateField = (field: Field, value: RecordValue) => {
    setForm((current) => ({ ...current, [field.key]: value }));
    if (resource === 'gallery' && field.key === 'type' && !editingId) {
      const prefix = galleryMediaPrefix(String(value));
      const nextNumber = records.filter((record) => String(record.media_id || '').startsWith(`${prefix}-`)).length + 1;
      setForm((current) => ({ ...current, type: value, media_id: `${prefix}-${String(nextNumber).padStart(3, '0')}` }));
    }
    const error = validateField(field, value);
    setFormErrors((current) => {
      const next = { ...current };
      if (error) next[field.key] = error;
      else delete next[field.key];
      return next;
    });
  };

  const save = async () => {
    const errors: Record<string, string> = {};
    config.fields.forEach((field) => {
      const error = validateField(field, form[field.key]);
      if (error) errors[field.key] = error;
    });
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    try {
      const endpoint = `/web-admin/${resource}${editingId ? `/${editingId}` : ''}`;
      const payload = { ...form };
      delete payload.sort_order;
      delete payload.poster;
      if (resource === 'enquiries' && typeof payload.email === 'string') payload.email = payload.email.toLowerCase();
      if (resource === 'gallery') {
        payload.is_active = true;
        if (String(payload.type) === 'image') payload.url = '';
        else payload.src = '';
      }
      if (resource === 'services') payload.is_active = toBoolean(payload.is_active);
      await (editingId ? api.patch(endpoint, payload) : api.post(endpoint, payload));
      toast.success(editingId ? 'Record updated' : 'Record created');
      setEditingId(null); setForm({}); setFormDialogOpen(false); await load();
    } catch (error: any) { toast.error(error.message || 'Failed to save record'); }
    finally { setSaving(false); }
  };

  const remove = async (record: WebRecord) => {
    try { await api.delete(`/web-admin/${resource}/${record.id}`); toast.success('Record deleted'); await load(); }
    catch (error: any) { toast.error(error.message || 'Failed to delete record'); }
  };

  const display = (value: RecordValue, field?: Field) => {
    if (field?.type === 'time') return formatTimeValue(value);
    if (field?.key === 'email' && value) return String(value).toLowerCase();
    if (field?.type === 'date' && value) {
      const rawValue = (value as unknown) instanceof Date ? (value as unknown as Date).toISOString().slice(0, 10) : String(value).slice(0, 10);
      const date = parse(rawValue, 'yyyy-MM-dd', new Date());
      if (isValid(date)) return format(date, 'dd-MMM-yyyy');
    }
    return typeof value === 'boolean' || value === 0 || value === 1 || value === '0' || value === '1' || value === 'true' || value === 'false' ? (toBoolean(value) ? 'Yes' : 'No') : value == null || value === '' ? '-' : String(value);
  };
  const mediaPreview = (record: WebRecord) => {
    const type = String(record.type || '');
    const source = String(type === 'image' ? record.src || '' : record.url || '');
    const fullSource = getLogoUrl(source);
    if (type === 'image' && fullSource) return <img src={fullSource} alt={String(record.title || 'Gallery media')} className="h-12 w-16 rounded-[5px] object-cover" loading="lazy" />;
    if (type === 'youtube' && source) {
      const match = source.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([^?&/]+)/);
      const thumbnail = match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
      return thumbnail ? <a href={source} target="_blank" rel="noreferrer"><img src={thumbnail} alt="YouTube video" className="h-12 w-16 rounded-[5px] object-cover" loading="lazy" /></a> : <a href={source} target="_blank" rel="noreferrer" className="text-primary underline">Video</a>;
    }
    if (type === 'instagram' && source) return <a href={source} target="_blank" rel="noreferrer" className="text-primary underline">Instagram</a>;
    if (fullSource && /\.(mp4|webm|ogg)(\?.*)?$/i.test(fullSource)) return <video src={fullSource} controls className="h-12 w-20 rounded-[5px] object-cover" />;
    return '-';
  };
  const visibleFields = config.fields.filter((field) => !(resource === 'appointments' && field.key === 'confirmation_method'));
  const tableColumns: Column<WebRecord>[] =
    resource === "appointments"
      ? [
          {
            key: "sno",
            header: "Sl.No",
            align: "center",
            width: "80px",
            sortable: false,
            render: (_record, index) => index + 1,
          },
          {
            key: "customer_name",
            header: "Customer name",
            align: "left",
            render: (record) => (
              <span className="block max-w-[220px] truncate">
                {display(record.customer_name)}
              </span>
            ),
          },
          {
            key: "phone",
            header: "Phone",
            align: "center",
            render: (record) => display(record.phone),
          },
          {
            key: "service",
            header: "Service",
            align: "left",
            render: (record) => (
              <span className="block max-w-[180px] truncate">
                {display(record.service)}
              </span>
            ),
          },
          {
            key: "preferred_date",
            header: "Preferred date",
            align: "center",
            render: (record) =>
              display(record.preferred_date, {
                key: "preferred_date",
                label: "Preferred date",
                type: "date",
              }),
          },
          {
            key: "preferred_time",
            header: "Preferred time",
            align: "center",
            render: (record) =>
              display(record.preferred_time, {
                key: "preferred_time",
                label: "Preferred time",
                type: "time",
              }),
          },
        ]
      : resource === "enquiries"
        ? [
            {
              key: "sno",
              header: "S.No",
              align: "center",
              width: "80px",
              sortable: false,
              render: (_record, index) => index + 1,
            },
            {
              key: "name",
              header: "Name",
              align: "left",
              render: (record) => (
                <span className="block max-w-[220px] truncate">
                  {display(record.name)}
                </span>
              ),
            },
            {
              key: "phone",
              header: "Phone",
              align: "center",
              render: (record) => display(record.phone),
            },
            {
              key: "email",
              header: "Email",
              align: "left",
              render: (record) => (
                <span className="block max-w-[260px] truncate">
                  {display(record.email, { key: "email", label: "Email" })}
                </span>
              ),
            },
            {
              key: "service",
              header: "Service",
              align: "left",
              render: (record) => (
                <span className="block max-w-[180px] truncate">
                  {display(record.service)}
                </span>
              ),
            },
          ]
        : resource === "testimonials"
          ? [
              {
                key: "sno",
                header: "S.No",
                align: "center",
                width: "80px",
                sortable: false,
                render: (_record, index) => index + 1,
              },
              {
                key: "customer_name",
                header: "Customer name",
                align: "left",
                render: (record) => (
                  <span className="block max-w-[220px] truncate">
                    {display(record.customer_name)}
                  </span>
                ),
              },
              {
                key: "testimonial",
                header: "Testimonial",
                align: "left",
                render: (record) => (
                  <span className="block max-w-[320px] truncate">
                    {display(record.testimonial)}
                  </span>
                ),
              },
              {
                key: "service",
                header: "Service",
                align: "left",
                render: (record) => (
                  <span className="block max-w-[180px] truncate">
                    {display(record.service)}
                  </span>
                ),
              },
              {
                key: "review_date",
                header: "Review date",
                align: "center",
                render: (record) =>
                  display(record.review_date, {
                    key: "review_date",
                    label: "Review date",
                    type: "date",
                  }),
              },
            ]
          : resource === "gallery"
            ? [
                {
                  key: "sno",
                  header: "S.No",
                  align: "center",
                  width: "100px",
                  sortable: false,
                  render: (_record, index) => index + 1,
                },
                {
                  key: "media_id",
                  header: "Media ID",
                  align: "left",
                  width: "150px",
                  render: (record) => (
                    <span className="block max-w-[180px] truncate">
                      {display(record.media_id)}
                    </span>
                  ),
                },
                {
                  key: "type",
                  header: "Type",
                  align: "center",
                  width: "100px",
                  render: (record) => titleCase(record.type),
                },
                {
                  key: "title",
                  header: "Title",
                  align: "left",
                  width: "40%",
                  render: (record) => (
                    <span className="block truncate">
                      {titleCase(record.title)}
                    </span>
                  ),
                },
                {
                  key: "media",
                  header: "Media",
                  align: "center",
                  width: "100px",
                  sortable: false,
                  render: (record) => mediaPreview(record),
                },
              ]
            : [
                ...(["enquiries", "services"].includes(resource)
                  ? [
                      {
                        key: "sno",
                        header: "S.No",
                        align: "center" as const,
                        width: "80px",
                        sortable: false,
                        render: (_record: WebRecord, index: number) =>
                          index + 1,
                      },
                    ]
                  : []),
                ...visibleFields.slice(0, 5).map((field) => ({
                  key: field.key,
                  header: field.label,
                  sortable: true,
                  align:
                    resource === "services" && field.key !== "is_active"
                      ? ("left" as const)
                      : ("center" as const),
                  render: (record) => (
                    <span className="block max-w-[240px] truncate">
                      {display(record[field.key], field)}
                    </span>
                  ),
                })),
              ];
  const filterKey = undefined;
  const filterOptions: Array<{ label: string; value: string }> = [];
  const formFields = resource === 'gallery'
    ? config.fields.filter((field) => {
      if (field.key === 'sort_order' || field.key === 'poster' || field.key === 'is_active') return false;
      if (field.key === 'src') return String(form.type || 'image') === 'image';
      if (field.key === 'url') return String(form.type || 'image') !== 'image';
      return true;
    }).sort((first, second) => {
      const order = ['type', 'media_id', 'title', 'src', 'url', 'caption'];
      return order.indexOf(first.key) - order.indexOf(second.key);
    })
    : visibleFields;

  return <div className="font-web space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><PageTitle>{config.title}</PageTitle><p className="text-muted-foreground mt-1">{config.description}</p></div>
      {resource !== 'enquiries' && resource !== 'appointments' && <Button className="rounded-[5px]" onClick={beginCreate}><Plus className="h-4 w-4 mr-2" />{resource === 'services' ? 'New service' : resource === 'gallery' ? 'Upload New Media' : 'Add record'}</Button>}
    </div>

    {Object.keys(form).length > 0 && resource !== 'testimonials' && <Dialog open={formDialogOpen} onOpenChange={(open) => { setFormDialogOpen(open); if (!open) { setForm({}); setEditingId(null); } }}>
      <DialogContent className="font-web max-h-[90vh] max-w-2xl overflow-y-auto rounded-[5px] p-0">
      <section className="space-y-5 p-6">
      <div className="flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit record' : 'New record'}</h2></div>
      <div className="grid gap-4 md:grid-cols-2">{formFields.map((field) => <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : resource === 'gallery' ? '[&>input]:mt-2' : ''}>
        {field.type === 'checkbox' ? <label className="flex items-center gap-3 text-sm font-medium"><Switch checked={toBoolean(form[field.key])} onCheckedChange={(checked) => updateField(field, checked)} />{field.label}{field.required && <span className="text-red-500" aria-hidden="true">*</span>}</label> : <><FieldLabel field={field} htmlFor={field.key} />{field.type === 'textarea' ? <Textarea id={field.key} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} value={String(form[field.key] ?? '')} onChange={(event) => updateField(field, event.target.value)} /> : field.type === 'select' ? <WebSelect value={String(form[field.key] ?? '')} options={field.key === 'service' && serviceOptions.length > 0 ? serviceOptions : field.options || []} placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} searchable={field.key !== 'service' && field.key !== 'status'} onChange={(value) => updateField(field, value)} /> : field.type === 'date' ? <WebDatePicker value={String(form[field.key] ?? '')} placeholder={field.placeholder || `Pick ${field.label.toLowerCase()}`} onChange={(value) => updateField(field, value)} /> : field.type === 'time' ? <WebTimePicker value={String(form[field.key] ?? '')} placeholder={field.placeholder || `Pick ${field.label.toLowerCase()}`} onChange={(value) => updateField(field, value)} /> : <Input id={field.key} type="text" inputMode={field.key === 'phone' ? 'tel' : field.type === 'number' ? 'numeric' : undefined} maxLength={field.key === 'phone' ? 10 : resource === 'testimonials' && field.key === 'rating' ? 1 : undefined} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} className="rounded-[5px]" value={String(form[field.key] ?? '')} onChange={(event) => { const value = field.key === 'phone' ? event.target.value.replace(/\D/g, '').slice(0, 10) : field.key === 'email' ? event.target.value.toLowerCase() : field.type === 'number' ? event.target.value.replace(/\D/g, '') : event.target.value; updateField(field, value); }} />}</>}
        {formErrors[field.key] && <p className="mt-1 text-xs text-destructive">{formErrors[field.key]}</p>}
        {resource === 'gallery' && field.key === 'src' && <div className="mt-2 flex flex-wrap items-center gap-2"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { handleGalleryFile(event.target.files?.[0]); event.currentTarget.value = ''; }} /><Button type="button" variant="outline" className="rounded-[5px]" onClick={() => fileInputRef.current?.click()} disabled={uploading}><Upload className="mr-2 h-4 w-4" />{uploading ? 'Uploading...' : 'Upload image'}</Button><span className="text-xs text-muted-foreground">JPG, PNG or WEBP up to 3 MB</span>{form.src && <a href={String(form.src)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary"><ImageIcon className="h-3.5 w-3.5" />Preview</a>}</div>}
      </div>)}</div>
      <div className="flex justify-end"><Button className="rounded-[5px]" onClick={() => void save()} disabled={saving || uploading}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : editingId ? 'Update details' : resource === 'gallery' ? 'Save details' : resource === 'services' ? 'Save details' : 'Save record'}</Button></div>
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
            {field.type === 'checkbox' ? <label className="flex items-center gap-3 text-sm font-medium"><Switch checked={toBoolean(form[field.key])} onCheckedChange={(checked) => updateField(field, checked)} />{field.label}{field.required && <span className="text-red-500" aria-hidden="true">*</span>}</label> : <><FieldLabel field={field} htmlFor={`testimonial-${field.key}`} />{field.type === 'textarea' ? <Textarea id={`testimonial-${field.key}`} placeholder={`Enter ${field.label.toLowerCase()}`} value={String(form[field.key] ?? '')} onChange={(event) => updateField(field, event.target.value)} /> : field.type === 'select' ? <WebSelect value={String(form[field.key] ?? '')} options={field.key === 'service' && serviceOptions.length > 0 ? serviceOptions : field.options || []} placeholder={`Select ${field.label.toLowerCase()}`} searchable={field.key !== 'service'} onChange={(value) => updateField(field, value)} /> : field.type === 'date' ? <WebDatePicker value={String(form[field.key] ?? '')} placeholder={`Pick ${field.label.toLowerCase()}`} onChange={(value) => updateField(field, value)} /> : <Input id={`testimonial-${field.key}`} type="text" inputMode={field.type === 'number' ? 'numeric' : undefined} maxLength={field.key === 'rating' ? 1 : undefined} placeholder={`Enter ${field.label.toLowerCase()}`} className="rounded-[5px]" value={String(form[field.key] ?? '')} onChange={(event) => { const value = field.key === 'customer_name' ? event.target.value.toUpperCase() : field.type === 'number' ? event.target.value.replace(/\D/g, '') : event.target.value; updateField(field, value); }} />}</>}
            {formErrors[field.key] && <p className="mt-1 text-xs text-destructive">{formErrors[field.key]}</p>}
          </div>)}</div>
          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" className="rounded-[5px]" onClick={() => setFormDialogOpen(false)}>Cancel</Button><Button className="rounded-[5px]" onClick={() => void save()} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : editingId ? 'Update details' : 'Save testimonial'}</Button></div>
        </div>}
      </DialogContent>
    </Dialog>

    <DataTable
      data={records}
      columns={tableColumns}
      searchKeys={config.fields.map((field) => field.key)}
      actions={(record) => <div className={resource === 'gallery' ? 'flex w-[200px] justify-center gap-1' : 'flex justify-center gap-1'}><Button variant="ghost" size="icon" onClick={() => beginEdit(record)} aria-label="Edit record" title="Edit record"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteRecord(record)} aria-label="Delete record" title="Delete record"><Trash2 className="h-4 w-4" /></Button></div>}
      filterKey={filterKey}
      filterOptions={filterOptions}
      pageSizeOptions={[10, 25, 50, 100]}
      loading={loading}
      exportFileName={`web-${resource}`}
    />
    <ConfirmDialog open={!!deleteRecord} onOpenChange={(open) => !open && setDeleteRecord(null)} onConfirm={() => { if (deleteRecord) void remove(deleteRecord); setDeleteRecord(null); }} title="Delete record" description="Are you sure you want to delete this record? This action cannot be undone." />
    <ImageCropDialog open={cropOpen} imageSrc={cropSource} aspect={16 / 9} cropShape="rect" onCropComplete={(blob) => void handleGalleryCrop(blob)} onClose={() => setCropOpen(false)} />
  </div>;
}