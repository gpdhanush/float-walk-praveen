import { useState, useEffect } from 'react';
import { useDataStore, InvoiceItem, Invoice } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Check, ChevronsUpDown, ArrowLeft, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function InvoiceForm() {
  const { id } = useParams();
  const { invoices, customers, addInvoice, updateInvoice, addCustomer, fetchInvoice } = useDataStore();
  const { language, gstPercent } = useSettingsStore();
  const navigate = useNavigate();
  const activeCustomers = customers.filter(c => !c.deleted_at);

  const [customerId, setCustomerId] = useState('');
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  
  // Manual customer details if not selecting existing
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Default one empty item
  const [items, setItems] = useState<InvoiceItem[]>([{ productName: '', quantity: 1, price: 0, total: 0 }]);
  const [isGstBill, setIsGstBill] = useState(true);
  const [gst, setGst] = useState(gstPercent);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'Invoice' | 'Quotation' | 'Advance Payment'>('Invoice');
  const [status, setStatus] = useState<'paid' | 'pending' | 'partial' | 'hold'>('paid'); // Default to 'paid'
  const [manualStatusChange, setManualStatusChange] = useState(false); // Track if user manually changed status
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd')); // Current date
  
  const isEditMode = !!id;
  const existingInvoice = isEditMode ? invoices.find(i => i.id === id) : null;

  useEffect(() => {
    if (isEditMode && id) {
      const invoice = invoices.find(i => i.id === id);
      if (!invoice || !invoice.items || invoice.items.length === 0) {
        fetchInvoice(id);
      }
    }
  }, [isEditMode, id, fetchInvoice]);

  useEffect(() => {
    if (isEditMode && existingInvoice) {
      console.log('[InvoiceForm] Loading existing invoice for edit:', existingInvoice);
      
      setCustomerId(existingInvoice.customerId || '');
      setCustomerName(existingInvoice.customerName || '');
      setCustomerMobile(existingInvoice.customerMobile || '');
      setCustomerEmail(existingInvoice.customerEmail || '');
      setCustomerAddress(existingInvoice.customerAddress || '');
      // Normalize items so quantity, price, total are numbers (API may return strings)
      const rawItems = existingInvoice.items || [];
      setItems(rawItems.map((it: InvoiceItem & { totalPrice?: number }) => {
        const q = Number(it.quantity ?? 0);
        const p = Number(it.price ?? 0);
        const t = Number(it.total ?? (it as any).totalPrice ?? 0) || q * p;
        return { productName: it.productName ?? '', quantity: q, price: p, total: t };
      }));
      setGst(Number(existingInvoice.gstPercent ?? 0));
      setIsGstBill(Number(existingInvoice.gstPercent ?? 0) > 0);
      setAdvancePaid(Number(existingInvoice.paidAmount ?? existingInvoice.advancePaid ?? 0));
      setNotes(existingInvoice.notes || '');
      setType(existingInvoice.type || 'Invoice');
      setStatus(existingInvoice.status || 'paid');
      setInvoiceDate(existingInvoice.date ? format(new Date(existingInvoice.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      
      console.log('[InvoiceForm] Loaded values:', {
        gst: existingInvoice.gstPercent,
        advancePaid: existingInvoice.paidAmount || existingInvoice.advancePaid,
        status: existingInvoice.status,
        type: existingInvoice.type,
        itemsCount: existingInvoice.items?.length
      });
    }
  }, [isEditMode, existingInvoice]);

  // Update GST percentage when toggle changes
  useEffect(() => {
    // Only update GST if not in edit mode or if user manually toggles
    // For edit mode, we loaded the initial GST. If user toggles, we follow the toggle.
    if (!isEditMode) {
      setGst(isGstBill ? (gstPercent || 18) : 0); // Default to 18% if GST enabled
    }
  }, [isGstBill, gstPercent, isEditMode]);
  
  // When GST Bill is enabled, ensure GST % is set (default 18%)
  useEffect(() => {
    if (isGstBill && gst === 0 && !isEditMode) {
      setGst(gstPercent || 18);
    }
  }, [isGstBill, gst, gstPercent, isEditMode]);

  // When customer ID changes, populate details
  useEffect(() => {
    if (!customerId) return;
    const customer = activeCustomers.find(c => c.id === customerId);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerMobile(customer.mobile);
      setCustomerEmail(customer.email || '');
      setCustomerAddress(customer.address || ''); // Ensure it's never undefined
    }
  }, [customerId, activeCustomers]);

  // Recalculate status when payment details change (only if user hasn't manually changed it)
  useEffect(() => {
    // Don't auto-calculate if user manually changed status
    if (manualStatusChange) return;
    
    // Simple calculation logic
    const sub = (items || []).reduce((s, i) => s + (i.total || 0), 0);
    const gstAmt = sub * (gst / 100);
    const total = sub + gstAmt;
    const due = total - advancePaid;

    let newStatus: 'paid' | 'pending' | 'partial' | 'hold' = 'pending';
    if (due <= 0 && total > 0) newStatus = 'paid';
    else if (advancePaid > 0) newStatus = 'partial';
    
    // Only update if it's different to avoid loops
    if (newStatus !== status) {
        setStatus(newStatus);
    }
  }, [items, gst, advancePaid, manualStatusChange]);

  const addItem = () => setItems([...items, { productName: '', quantity: 1, price: 0, total: 0 }]);

  const updateItem = (idx: number, field: string, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[idx], [field]: value };
    item.total = (item.quantity || 0) * (item.price || 0);
    newItems[idx] = item;
    setItems(newItems);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  // Totals with round-off to nearest rupee (ensure numbers to avoid NaN/concatenation)
  const subtotal = (items || []).reduce((s, i) => s + Number(i.total ?? 0), 0);
  const gstAmount = Number(subtotal) * (Number(gst) / 100);
  const rawGrandTotal = Number(subtotal) + Number(gstAmount);
  const roundOff = Math.round(rawGrandTotal) - rawGrandTotal;
  const grandTotal = rawGrandTotal + roundOff;
  const balanceDue = Number(grandTotal) - Number(advancePaid);

  const handleSave = async () => {
    if (!customerName || items.length === 0) {
      toast.error('Customer name and items are required');
      return;
    }

    let finalCustomerId = customerId;

    // Create new customer if not selected from list
    if (!finalCustomerId) {
      const newId = await addCustomer({
        name: customerName,
        mobile: customerMobile,
        address: customerAddress,
        email: '',
        notes: ''
      });
      if (newId) finalCustomerId = newId;
    }

    console.log('[InvoiceForm] handleSave called');
    console.log('[InvoiceForm] Current items:', items.length);
    console.log('[InvoiceForm] Items data:', items.map(i => ({ name: i.productName, qty: i.quantity, price: i.price })));
    
    try {
      if (isEditMode && id) {
        // Convert items to match backend format
        const formattedItems = items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          unitPrice: item.price,
          total: item.total,
          totalPrice: item.total,
        }));
        
        console.log('[InvoiceForm] Updating invoice with', formattedItems.length, 'items');
        console.log('[InvoiceForm] Update data:', {
          status,
          type,
          subtotal,
          gst,
          gstAmount,
          grandTotal,
          advancePaid
        });
        
        await updateInvoice(id, {
          customerId: finalCustomerId || '',
          customerName,
          customerMobile,
          customerEmail,
          customerAddress,
          totalAmount: grandTotal,
          paidAmount: advancePaid,
          status,
          type,
          notes,
          items: formattedItems,
          subtotal,
          gstPercent: gst,
          gstAmount,
          grandTotal,
          advancePaid,
        }); 
        toast.success('Invoice updated');
        navigate(`/invoices`);
      } else {
        // Convert items for new invoice too
        const formattedItems = items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          unitPrice: item.price,
          total: item.total,
          totalPrice: item.total,
        }));
        
        console.log('[InvoiceForm] Creating invoice with', formattedItems.length, 'items');
        console.log('[InvoiceForm] Create data:', {
          status,
          type,
          date: invoiceDate,
          subtotal,
          gst,
          gstAmount,
          grandTotal,
          advancePaid
        });
        
        const resultId = await addInvoice({
          customerId: finalCustomerId || '',
          customerName,
          customerMobile,
          customerEmail,
          customerAddress,
          totalAmount: grandTotal,
          paidAmount: advancePaid,
          status,
          payments: [],
          notes,
          date: invoiceDate,
          type,
          items: formattedItems,
          subtotal,
          gstPercent: gst,
          gstAmount,
          grandTotal,
          advancePaid,
        });

        if (resultId) {
          toast.success('Invoice created');
          navigate(`/invoice/${resultId}`);
        } else {
          toast.error('Failed to create invoice');
        }
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'An error occurred while saving the invoice');
    }
  };

  return (
    <div className="space-y-6 w-full p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-display text-2xl font-bold">{isEditMode ? 'Edit Invoice' : t('new_invoice', language)}</h1>
      </div>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice Details</CardTitle>
            <div className="flex gap-4">
                <Select value={status} onValueChange={(v: any) => { 
                  setStatus(v); 
                  setManualStatusChange(true); // Mark that user manually changed it
                }}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="hold">Hold</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Quotation">Quotation</SelectItem>
                        <SelectItem value="Advance Payment">Advance Payment</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Customer Section */}
            <div className="space-y-4 border-b pb-4">
              <Label>Customer Details</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input 
                    placeholder="Mobile Number" 
                    value={customerMobile} 
                    maxLength={10}
                    className="w-full"
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) {
                            setCustomerMobile(val);
                            setCustomerSearchOpen(true);
                            // If we had a selected customer and changed number, clear details
                            if (customerId) {
                                setCustomerId(''); 
                                setCustomerName('');
                                setCustomerEmail('');
                                setCustomerAddress('');
                            }
                        }
                    }}
                    onFocus={() => setCustomerSearchOpen(true)}
                    onBlur={() => setTimeout(() => setCustomerSearchOpen(false), 200)}
                    onKeyDown={e => {
                      // Open dropdown on down arrow key
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (!customerSearchOpen) {
                          setCustomerSearchOpen(true);
                        } else {
                          // If already open, focus first item
                          setTimeout(() => {
                            const firstItem = document.querySelector('[data-customer-item]') as HTMLElement;
                            if (firstItem) {
                              firstItem.focus();
                            }
                          }, 10);
                        }
                      }
                      // Select first customer on Enter if dropdown is open
                      if (e.key === 'Enter' && customerSearchOpen) {
                        e.preventDefault();
                        const matches = activeCustomers.filter(c => c.mobile.includes(customerMobile));
                        if (matches.length > 0) {
                          const first = matches[0];
                          setCustomerId(first.id);
                          setCustomerName(first.name);
                          setCustomerMobile(first.mobile);
                          setCustomerEmail(first.email || '');
                          setCustomerAddress(first.address);
                          setCustomerSearchOpen(false);
                        }
                      }
                    }}
                  />
                  {customerSearchOpen && customerMobile && (
                      <div className="absolute z-50 w-full bg-white dark:bg-gray-800 text-popover-foreground shadow-lg rounded-md border border-gray-200 dark:border-gray-700 mt-1 max-h-[200px] overflow-auto">
                          {activeCustomers.filter(c => c.mobile.includes(customerMobile)).length > 0 ? (
                              activeCustomers.filter(c => c.mobile.includes(customerMobile)).map((c, idx) => (
                                  <div 
                                    key={c.id}
                                    data-customer-item
                                    tabIndex={0}
                                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer text-sm flex justify-between items-center border-b last:border-0 outline-none"
                                    onClick={() => {
                                        setCustomerId(c.id);
                                        setCustomerName(c.name);
                                        setCustomerMobile(c.mobile);
                                        setCustomerEmail(c.email || '');
                                        setCustomerAddress(c.address);
                                        setCustomerSearchOpen(false);
                                    }}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setCustomerId(c.id);
                                        setCustomerName(c.name);
                                        setCustomerMobile(c.mobile);
                                        setCustomerEmail(c.email || '');
                                        setCustomerAddress(c.address);
                                        setCustomerSearchOpen(false);
                                      } else if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (next) next.focus();
                                      } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        const prev = e.currentTarget.previousElementSibling as HTMLElement;
                                        if (prev) prev.focus();
                                        else {
                                          // Go back to input
                                          const input = document.querySelector('input[placeholder="Mobile Number"]') as HTMLElement;
                                          if (input) input.focus();
                                        }
                                      } else if (e.key === 'Escape') {
                                        setCustomerSearchOpen(false);
                                        const input = document.querySelector('input[placeholder="Mobile Number"]') as HTMLElement;
                                        if (input) input.focus();
                                      }
                                    }}
                                  >
                                      <span className="font-semibold">{c.mobile}</span>
                                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{c.name}</span>
                                  </div>
                              ))
                          ) : (
                              <div className="p-3 text-sm text-gray-500 italic text-center">
                                No customer found. New customer will be created.
                              </div>
                          )}
                      </div>
                  )}
                </div>

                <Input 
                  placeholder="Customer Name" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                />
                <Input 
                  placeholder="Address" 
                  className="md:col-span-2" 
                  value={customerAddress} 
                  onChange={e => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Date and GST Toggle Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !invoiceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceDate ? (
                        format(new Date(invoiceDate), 'dd-MMM-yyyy')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={invoiceDate ? new Date(invoiceDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setInvoiceDate(format(date, 'yyyy-MM-dd'));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Bill Type</Label>
                <div className="flex items-center gap-4 h-10">
                  <span className="text-sm text-muted-foreground">Non-GST</span>
                  <Switch 
                    checked={isGstBill} 
                    onCheckedChange={(checked) => {
                      setIsGstBill(checked);
                      setGst(checked ? gstPercent : 0);
                    }}
                  />
                  <span className="text-sm font-medium">GST Bill</span>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-muted/20 p-2 rounded-lg border border-transparent hover:border-border transition-colors">
                  <div className="col-span-5">
                    <Input 
                        placeholder="Item Name" 
                        value={item.productName} 
                        onChange={e => updateItem(idx, 'productName', e.target.value)} 
                        className="bg-background"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', +e.target.value)} className="bg-background px-1 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" placeholder="Price" value={item.price} onChange={e => updateItem(idx, 'price', +e.target.value)} className="bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div className="col-span-3">
                    <Input value={`₹${item.total.toLocaleString('en-IN')}`} readOnly className="bg-muted font-medium" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {isGstBill && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t pt-4">
                  <div className="flex items-center space-x-3">
                      <Label htmlFor="gst-select" className="text-sm font-medium">GST %</Label>
                      <Select value={String(gst)} onValueChange={(v) => {
                        const val = Number(v);
                        setGst(val);
                        setIsGstBill(val > 0);
                      }}>
                        <SelectTrigger className="w-[140px] px-3">
                          <SelectValue placeholder="Select GST" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0% (Non-GST)</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="28">28%</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                <div className="space-y-2"><Label>{t('advance', language)}</Label><Input type="number" value={Number(advancePaid) || 0} onChange={e => setAdvancePaid(Number(e.target.value) || 0)} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /></div>
              </div>
            )}

            {!isGstBill && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t pt-4">
                <div />
                <div className="space-y-2"><Label>{t('advance', language)}</Label><Input type="number" value={Number(advancePaid) || 0} onChange={e => setAdvancePaid(Number(e.target.value) || 0)} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /></div>
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-1 text-sm max-w-xs ml-auto shadow-sm border">
              <div className="flex justify-between">
                <span>{t('subtotal', language)}</span>
                <span>₹{(Number(subtotal) || 0).toLocaleString('en-IN')}</span>
              </div>
              {isGstBill && (Number(gstAmount) || 0) > 0 && (
                <div className="flex justify-between">
                  <span>GST ({Number(gst)}%)</span>
                  <span>₹{(Number(gstAmount) || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              {roundOff !== 0 && !Number.isNaN(roundOff) && (
                <div className="flex justify-between">
                  <span>Round Off</span>
                  <span>{roundOff > 0 ? '+' : ''}{(Number(roundOff) || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-1 mt-1">
                <span>{t('grand_total', language)}</span>
                <span>₹{(Number(grandTotal) || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>{t('advance', language)}</span>
                <span>-₹{(Number(advancePaid) || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t-2 border-primary/20 pt-2 text-primary">
                <span>{t('balance', language)} Due</span>
                <span>₹{(Number(balanceDue) || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2"><Label>{t('notes', language)}</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/invoices')}>{t('cancel', language)}</Button>
            <Button onClick={handleSave}>{isEditMode ? 'Update Invoice' : 'Create Invoice'}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
