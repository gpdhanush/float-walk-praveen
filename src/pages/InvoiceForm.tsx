import { useState, useEffect } from 'react';
import { useDataStore, InvoiceItem, Invoice } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Check, ChevronsUpDown, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle } from '@/components/shared/PageTitle';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePicker } from '@/components/ui/date-time-picker';
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
  const { invoices, customers, products, addInvoice, updateInvoice, addCustomer, fetchInvoice } = useDataStore();
  const { language, gstPercent, isLoaded: settingsLoaded } = useSettingsStore();
  const navigate = useNavigate();
  const activeCustomers = customers.filter(c => !c.deleted_at);
  const activeProducts = (products || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const [productPickerOpen, setProductPickerOpen] = useState<Record<number, boolean>>({});
  const [productSearch, setProductSearch] = useState<Record<number, string>>({});
  const [customItemMode, setCustomItemMode] = useState<Record<number, boolean>>({});

  const [customerId, setCustomerId] = useState('');
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  
  // Manual customer details if not selecting existing
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Default one empty item
  const [items, setItems] = useState<InvoiceItem[]>([
    { productName: '', quantity: 1, scan: 0, price: 0, total: 0 },
  ]);
  const [isGstBill, setIsGstBill] = useState(false);
  const [gst, setGst] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'Invoice' | 'Advance Payment'>('Invoice');
  const [status, setStatus] = useState<'paid' | 'pending' | 'partial' | 'hold'>('pending');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
      setItems(
        rawItems.map((it: InvoiceItem & { totalPrice?: number; scanPrice?: number }) => {
          const q = Number(it.quantity ?? 0);
          const p = Number(it.price ?? 0);
          const scan = Number(it.scan ?? it.scanPrice ?? 0);
          const t = Number(it.total ?? it.totalPrice ?? 0) || q * p + scan;
          return { productName: it.productName ?? '', quantity: q, scan, price: p, total: t };
        }),
      );
      const existingGst = Number((existingInvoice as any).gstPercent ?? (existingInvoice as any).gst_percent ?? 0);
      setGst(existingGst);
      setIsGstBill(existingGst > 0);
      setAdvancePaid(Number(existingInvoice.paidAmount ?? existingInvoice.advancePaid ?? 0));
      setNotes(existingInvoice.notes || '');
      setType(existingInvoice.type || 'Invoice');
      setStatus(existingInvoice.status || 'paid');
      setInvoiceDate(existingInvoice.date ? format(new Date(existingInvoice.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      
      console.log('[InvoiceForm] Loaded values:', {
        gst: (existingInvoice as any).gstPercent ?? (existingInvoice as any).gst_percent,
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
      setGst(isGstBill ? (gstPercent ?? 18) : 0); // Default only when no saved value exists
    }
  }, [isGstBill, gstPercent, isEditMode, settingsLoaded]);

  // When GST Bill is enabled, ensure GST % is set (default 18%)
  useEffect(() => {
    if (isGstBill && gst === 0 && !isEditMode) {
      setGst(Number(gstPercent) || 18);
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

  const addItem = () =>
    setItems([...items, { productName: '', quantity: 1, scan: 0, price: 0, total: 0 }]);

  const updateItem = (
    idx: number,
    field: 'productName' | 'quantity' | 'scan' | 'price',
    value: string | number,
  ) => {
    const newItems = [...items];
    const item = { ...newItems[idx], [field]: value };
    item.total = (Number(item.quantity) || 0) * (Number(item.price) || 0) + (Number(item.scan) || 0);
    newItems[idx] = item;
    setItems(newItems);
  };

  const selectProductForItem = (idx: number, productName: string) => {
    const product = activeProducts.find(p => p.name === productName);
    if (!product) {
      updateItem(idx, 'productName', productName);
      return;
    }
    // When selecting a product, map name + price into the line item.
    const newItems = [...items];
    const item = { ...newItems[idx], productName: product.name, price: Number(product.price ?? 0) };
    item.total = (Number(item.quantity) || 0) * (Number(item.price) || 0) + (Number(item.scan) || 0);
    newItems[idx] = item;
    setItems(newItems);
  };

  const enableCustomItemForRow = (idx: number) => {
    setCustomItemMode((s) => ({ ...s, [idx]: true }));
    setProductPickerOpen((s) => ({ ...s, [idx]: false }));
    setProductSearch((s) => ({ ...s, [idx]: '' }));
    // Clear name so user can type their own
    updateItem(idx, 'productName', '');
  };

  const enableProductPickerForRow = (idx: number) => {
    setCustomItemMode((s) => ({ ...s, [idx]: false }));
    setProductSearch((s) => ({ ...s, [idx]: '' }));
    setProductPickerOpen((s) => ({ ...s, [idx]: true }));
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  // Totals with round-off to nearest rupee (ensure numbers to avoid NaN/concatenation)
  const subtotal = (items || []).reduce((s, i) => s + Number(i.total ?? 0), 0);
  const gstAmount = Number(subtotal) * (Number(gst) / 100);
  const rawGrandTotal = Number(subtotal) + Number(gstAmount);
  const roundOff = Math.round(rawGrandTotal) - rawGrandTotal;
  const grandTotal = rawGrandTotal + roundOff;
  const balanceDue = Number(grandTotal) - Number(advancePaid);

  const calculatedStatus: 'paid' | 'pending' | 'partial' | 'hold' =
    status === 'hold' && manualStatusChange
      ? 'hold'
      : balanceDue <= 0 && grandTotal > 0
        ? 'paid'
        : advancePaid > 0
          ? 'partial'
          : 'pending';
  const effectiveStatus = manualStatusChange ? status : calculatedStatus;
  const effectiveType = isEditMode && existingInvoice?.type === 'Advance Payment' && effectiveStatus === 'paid' && balanceDue <= 0
    ? 'Invoice'
    : type;

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    const normalizedName = customerName.trim();
    const normalizedMobile = customerMobile.trim();
    if (!normalizedName) errors.customerName = 'Customer name is required';
    if (!/^\d{10}$/.test(normalizedMobile)) errors.customerMobile = 'Enter a valid 10-digit mobile number';
    if (items.length === 0) errors.items = 'Add at least one item';
    items.forEach((item, index) => {
      if (!item.productName.trim()) errors[`item-${index}`] = 'Select or enter an item';
      if (Number(item.quantity) <= 0) errors[`item-${index}`] = 'Quantity must be greater than 0';
      if (Number(item.price) < 0 || Number(item.scan ?? 0) < 0) errors[`item-${index}`] = 'Amounts cannot be negative';
    });
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please complete the required customer and item details');
      return;
    }

    let finalCustomerId = customerId;

    // Create new customer if not selected from list
    if (!finalCustomerId) {
      const existingCustomer = activeCustomers.find((customer) => customer.mobile === normalizedMobile);
      if (existingCustomer) finalCustomerId = existingCustomer.id;
    }
    if (!finalCustomerId) {
      const newId = await addCustomer({
        name: normalizedName,
        mobile: normalizedMobile,
        address: customerAddress,
        email: '',
        notes: ''
      });
      if (newId) finalCustomerId = newId;
    }
    if (!finalCustomerId) {
      toast.error('Could not create or find this customer');
      return;
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
          scan: Number(item.scan ?? 0),
          unitPrice: item.price,
          scanPrice: Number(item.scan ?? 0),
          total: item.total,
          totalPrice: item.total,
        }));
        
        console.log('[InvoiceForm] Updating invoice with', formattedItems.length, 'items');
        console.log('[InvoiceForm] Update data:', {
          status: effectiveStatus,
          type: effectiveType,
          subtotal,
          gst,
          gstAmount,
          grandTotal,
          advancePaid
        });
        
        await updateInvoice(id, {
          customerId: finalCustomerId,
          customerName: normalizedName,
          customerMobile: normalizedMobile,
          customerEmail,
          customerAddress,
          paidAmount: advancePaid,
          status: effectiveStatus,
          type: effectiveType,
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
          scan: Number(item.scan ?? 0),
          unitPrice: item.price,
          scanPrice: Number(item.scan ?? 0),
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
          customerId: finalCustomerId,
          customerName: normalizedName,
          customerMobile: normalizedMobile,
          customerEmail,
          customerAddress,
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
        <PageTitle>{isEditMode ? 'Edit Invoice' : t('new_invoice', language)}</PageTitle>
      </div>

      <Card className="w-full [&_input]:bg-transparent [&_textarea]:bg-transparent [&_[role=combobox]]:bg-transparent">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Invoice Details</CardTitle>
            <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="flex h-10 items-center gap-2 rounded-[5px] border border-border px-3">
                  <Label className="text-sm">Bill Type</Label>
                  <span className="text-xs text-muted-foreground">Non-GST</span>
                  <Switch
                    checked={isGstBill}
                    onCheckedChange={(checked) => {
                      setIsGstBill(checked);
                      setGst(checked ? (Number(gstPercent) || 18) : 0);
                    }}
                  />
                  <span className="text-xs font-medium">GST</span>
                </div>
                <Select value={status} onValueChange={(v: any) => { 
                  setStatus(v); 
                  setManualStatusChange(true); // Mark that user manually changed it
                }}>
                    <SelectTrigger className="w-[130px]">
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
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Advance Payment">Advance Payment</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Customer Section */}
            <div className="space-y-4 border-b pb-4">
              <Label>Customer Details</Label>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="relative space-y-2">
                  <Label>Mobile Number</Label>
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
                      <div className="absolute z-50 w-full bg-white dark:bg-gray-800 text-popover-foreground shadow-lg rounded-[5px] border border-gray-200 dark:border-gray-700 mt-1 max-h-[200px] overflow-auto">
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
                  {validationErrors.customerMobile && <p className="text-xs text-destructive">{validationErrors.customerMobile}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  {validationErrors.customerName && <p className="text-xs text-destructive">{validationErrors.customerName}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <DatePicker value={invoiceDate} placeholder="Pick a date" onChange={setInvoiceDate} />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Items</Label>
                <Button type="button" size="sm" onClick={addItem} className="rounded-[5px] bg-primary text-primary-foreground shadow-none hover:bg-primary/90">Add Item</Button>
              </div>
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground px-2">
                <div className="col-span-4">Items</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Scan Amount</div>
                <div className="col-span-2">Total Price</div>
                <div className="col-span-1" />
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-muted/20 p-2 rounded-[5px]">
                  <div className="col-span-4">
                    {customItemMode[idx] ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Other item name"
                          value={item.productName}
                          onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                          className="bg-transparent"
                        />
                        <Button type="button" variant="outline" onClick={() => enableProductPickerForRow(idx)}>
                          Select
                        </Button>
                      </div>
                    ) : (
                      <Popover
                        open={!!productPickerOpen[idx]}
                        onOpenChange={(open) => setProductPickerOpen((s) => ({ ...s, [idx]: open }))}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between rounded-[5px] bg-transparent font-normal",
                              !item.productName && "text-muted-foreground",
                            )}
                          >
                            <span className="truncate">
                              {item.productName ? item.productName : "Select product"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="z-[100] w-[360px] rounded-[5px] bg-white p-0 text-black dark:bg-slate-900 dark:text-white" align="start">
                          <div className="border-b border-gray-200 p-2 dark:border-slate-700">
                            <Input
                              autoFocus
                              placeholder="Search products..."
                              value={productSearch[idx] || ''}
                              onChange={(event) => setProductSearch((search) => ({ ...search, [idx]: event.target.value }))}
                              className="h-9 border-0 bg-transparent text-black shadow-none focus-visible:ring-0 dark:text-white"
                            />
                          </div>
                          <div className="max-h-[260px] overflow-y-auto p-1">
                            <button
                              type="button"
                              onClick={() => enableCustomItemForRow(idx)}
                              className="flex w-full rounded-[5px] px-3 py-2 text-left text-sm text-black hover:bg-gray-100 hover:text-black dark:text-white dark:hover:bg-slate-800 dark:hover:text-black"
                            >
                              Other (Custom item)
                            </button>
                            {activeProducts
                              .filter((product) => product.name.toLowerCase().includes((productSearch[idx] || '').trim().toLowerCase()))
                              .map((product) => (
                                <button
                                  type="button"
                                  key={product.id}
                                  onClick={() => {
                                    selectProductForItem(idx, product.name);
                                    setProductSearch((search) => ({ ...search, [idx]: '' }));
                                    setProductPickerOpen((open) => ({ ...open, [idx]: false }));
                                  }}
                                  className="flex w-full items-center justify-between rounded-[5px] px-3 py-2 text-left text-sm text-black hover:bg-gray-100 hover:text-black dark:text-white dark:hover:bg-slate-800 dark:hover:text-black"
                                >
                                  <span className="truncate">{product.name}</span>
                                  <span className="ml-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                    ₹{Number(product.price ?? 0).toLocaleString('en-IN')}
                                  </span>
                                </button>
                              ))}
                            {activeProducts.filter((product) => product.name.toLowerCase().includes((productSearch[idx] || '').trim().toLowerCase())).length === 0 && (
                              <p className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No products found.</p>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value.replace(/\D/g, '')) || 0)} className="bg-transparent px-1 text-center" />
                  </div>
                  <div className="col-span-2">
                    <Input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Price" value={item.price} onChange={e => updateItem(idx, 'price', Number(e.target.value.replace(/\D/g, '')) || 0)} className="bg-transparent" />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Scan Amount"
                      value={Number(item.scan ?? 0)}
                      onChange={e => updateItem(idx, 'scan', Number(e.target.value.replace(/\D/g, '')) || 0)}
                      className="bg-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input value={`₹${item.total.toLocaleString('en-IN')}`} readOnly className="bg-muted font-medium" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {validationErrors.items && <p className="text-xs text-destructive">{validationErrors.items}</p>}
              {Object.keys(validationErrors).some((key) => key.startsWith('item-')) && (
                <p className="text-xs text-destructive">Each item needs a name, a quantity greater than 0, and valid amounts.</p>
              )}
            </div>

            {isGstBill && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t pt-4">
                  <div className="flex items-center space-x-3">
                      <Label htmlFor="gst-select" className="text-sm font-medium">GST %</Label>
                      <Select value={String(Number(gst))} onValueChange={(v) => {
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
                <div className="space-y-2"><Label>{t('advance', language)}</Label><Input type="text" inputMode="numeric" pattern="[0-9]*" value={Number(advancePaid) || 0} onChange={e => setAdvancePaid(Number(e.target.value.replace(/\D/g, '')) || 0)} className="bg-transparent" /></div>
              </div>
            )}

            {!isGstBill && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t pt-4">
                <div />
                <div className="space-y-2"><Label>{t('advance', language)}</Label><Input type="text" inputMode="numeric" pattern="[0-9]*" value={Number(advancePaid) || 0} onChange={e => setAdvancePaid(Number(e.target.value.replace(/\D/g, '')) || 0)} className="bg-transparent" /></div>
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

            <div className="space-y-2"><Label>{t('notes', language)}</Label><Textarea placeholder="Add any notes or special instructions..." value={notes} onChange={e => setNotes(e.target.value)} /></div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/invoices')} className="rounded-[5px] border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground">{t('cancel', language)}</Button>
            <Button onClick={handleSave} className="rounded-[5px] bg-primary text-primary-foreground shadow-none hover:bg-primary/90">{isEditMode ? 'Update Invoice' : 'Create Invoice'}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
