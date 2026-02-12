import { useState } from 'react';
import { useDataStore, Invoice, InvoiceItem } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Invoices() {
  const { invoices, customers, products, addInvoice } = useDataStore();
  const { language, gstPercent } = useSettingsStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const activeCustomers = customers.filter(c => !c.deleted_at);
  const activeProducts = products.filter(p => !p.deleted_at);

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [gst, setGst] = useState(gstPercent);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [notes, setNotes] = useState('');

  const addItem = () => setItems([...items, { productId: '', productName: '', quantity: 1, price: 0, total: 0 }]);

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[idx], [field]: value };
    if (field === 'productId') {
      const prod = activeProducts.find(p => p.id === value);
      if (prod) { item.productName = prod.name; item.price = prod.price; }
    }
    item.total = item.quantity * item.price;
    newItems[idx] = item;
    setItems(newItems);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const gstAmount = subtotal * (gst / 100);
  const grandTotal = subtotal + gstAmount;
  const balanceDue = grandTotal - advancePaid;

  const handleSave = () => {
    if (!customerId || items.length === 0) { toast.error('Select customer and add items'); return; }
    const customer = activeCustomers.find(c => c.id === customerId);
    if (!customer) return;

    const invNum = `INV-${String(invoices.length + 1).padStart(4, '0')}`;
    const status = balanceDue <= 0 ? 'paid' : advancePaid > 0 ? 'partial' : 'pending';

    const id = addInvoice({
      invoiceNumber: invNum,
      customerId,
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerAddress: customer.address,
      items,
      subtotal,
      gstPercent: gst,
      gstAmount,
      grandTotal,
      advancePaid,
      balanceDue,
      status: status as any,
      payments: [],
      notes,
      date: format(new Date(), 'yyyy-MM-dd'),
    });

    toast.success('Invoice created');
    setOpen(false);
    navigate(`/invoice/${id}`);
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'customerName', header: 'Customer' },
    { key: 'grandTotal', header: t('total', language), render: (i: Invoice) => `₹${i.grandTotal.toLocaleString('en-IN')}` },
    { key: 'balanceDue', header: t('balance', language), render: (i: Invoice) => `₹${i.balanceDue.toLocaleString('en-IN')}` },
    {
      key: 'status', header: t('status', language), render: (i: Invoice) => (
        <Badge variant={i.status === 'paid' ? 'default' : i.status === 'partial' ? 'secondary' : 'destructive'}>
          {i.status}
        </Badge>
      )
    },
    { key: 'date', header: t('date', language) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('invoices', language)}</h1>
        <Button onClick={() => { setOpen(true); setItems([]); setCustomerId(''); setAdvancePaid(0); setGst(gstPercent); setNotes(''); }} className="gap-2">
          <Plus className="w-4 h-4" />{t('new_invoice', language)}
        </Button>
      </div>

      <DataTable data={invoices} columns={columns} searchKeys={['invoiceNumber', 'customerName']} exportFileName="invoices"
        actions={(inv: Invoice) => (
          <Button variant="ghost" size="icon" onClick={() => navigate(`/invoice/${inv.id}`)}><Eye className="w-4 h-4" /></Button>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{t('new_invoice', language)}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{activeCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.mobile}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Select value={item.productId} onValueChange={v => updateItem(idx, 'productId', v)}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Product" /></SelectTrigger>
                      <SelectContent>{activeProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2"><Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', +e.target.value)} /></div>
                  <div className="col-span-3"><Input type="number" placeholder="Price" value={item.price} onChange={e => updateItem(idx, 'price', +e.target.value)} /></div>
                  <div className="col-span-2 text-sm font-medium">₹{item.total.toLocaleString('en-IN')}</div>
                  <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="w-3 h-3 text-destructive" /></Button></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>GST %</Label><Input type="number" value={gst} onChange={e => setGst(+e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('advance', language)}</Label><Input type="number" value={advancePaid} onChange={e => setAdvancePaid(+e.target.value)} /></div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
              <div className="flex justify-between"><span>{t('subtotal', language)}</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>GST ({gst}%)</span><span>₹{gstAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>{t('advance', language)}</span><span className="text-destructive">-₹{advancePaid.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>{t('grand_total', language)}</span><span>₹{balanceDue.toLocaleString('en-IN')}</span></div>
            </div>

            <div className="space-y-2"><Label>{t('notes', language)}</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t('cancel', language)}</Button>
            <Button onClick={handleSave}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
