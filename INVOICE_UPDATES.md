# Invoice Form & Login Updates

## Changes Made

### 1. Login Page Updates
**File:** `src/pages/Login.tsx`

#### Changed Company Name
- **Old:** "FootWear Pro"
- **New:** "Float Walk"

### 2. Invoice Form Enhancements
**File:** `src/pages/InvoiceForm.tsx`

#### A. Date Field
- ✅ Added date picker with current date as default
- ✅ User can select any date
- ✅ Date is saved with the invoice
- ✅ In edit mode, loads existing invoice date

```tsx
const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));

<Input 
  type="date" 
  value={invoiceDate} 
  onChange={e => setInvoiceDate(e.target.value)}
/>
```

#### B. GST Toggle Button
- ✅ Added toggle switch: "Non-GST" ↔ "GST Bill"
- ✅ Defaults to GST Bill (ON)
- ✅ Gets default GST percentage from database (`gstPercent` setting)
- ✅ When Non-GST selected:
  - GST percentage dropdown is hidden
  - GST amount is hidden in subtotal area
  - GST is hidden in print view (already handled - only shows if gstAmount > 0)

```tsx
<div className="flex items-center gap-4">
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
```

#### C. Number Input Arrows Hidden
- ✅ Removed up/down arrows from all number inputs
- Applied to: Quantity, Price, Advance fields
- Uses Tailwind classes:

```tsx
className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
```

#### D. Default Status Changed
- **Old:** Default status was "pending"
- **New:** Default status is "paid"

```tsx
const [status, setStatus] = useState<'paid' | 'pending' | 'partial' | 'hold'>('paid');
```

### 3. Logo Display Enhancements
**Files:** `src/components/layout/SimpleSidebar.tsx`, `src/pages/SettingsNew.tsx`

#### Invalid Logo Fallback
- ✅ If logo URL is invalid or fails to load
- ✅ Shows store name's first letter in a colored circle
- ✅ Uses primary color as background
- ✅ Gracefully handles image load errors

**Sidebar:**
```tsx
const [logoError, setLogoError] = useState(false);

<img 
  src={fullLogoUrl} 
  alt="Logo" 
  onError={() => setLogoError(true)}
/>

// Fallback if error
<div className="w-12 h-12 rounded-full bg-sidebar-primary">
  <span className="text-xl font-bold text-sidebar-primary-foreground">
    {storeName?.charAt(0)?.toUpperCase() || 'S'}
  </span>
</div>
```

**Settings Page:**
```tsx
<div className="w-24 h-24 rounded-full bg-primary">
  <span className="text-3xl font-bold text-primary-foreground">
    {storeForm.storeName?.charAt(0)?.toUpperCase() || 'S'}
  </span>
</div>
```

## Summary of Features

### Invoice Form Layout (Top to Bottom)
1. **Header:** Status dropdown, Type dropdown
2. **Customer Details:** Mobile, Name, Address
3. **Date & GST Toggle:** Invoice date, Non-GST/GST Bill switch
4. **Items:** Product name, Quantity, Price, Total
5. **GST Section:** (Only shows if GST Bill is ON)
   - GST percentage dropdown
   - Advance paid field
6. **Subtotal Summary:**
   - Subtotal
   - GST (only if GST Bill)
   - Grand Total
   - Advance (deduction)
   - Balance Due

### Print View
- GST number in header (only if set in settings)
- Items table
- Subtotal
- **GST line only appears if gstAmount > 0** (Non-GST bills automatically hide it)
- Grand total

## User Experience Improvements

1. ✅ **Cleaner number inputs** - No distracting arrows
2. ✅ **Flexible billing** - Easy toggle between GST and Non-GST
3. ✅ **Date control** - Select invoice date (defaults to today)
4. ✅ **Realistic default** - Most invoices are paid immediately
5. ✅ **Graceful fallback** - Branded fallback for invalid logos
6. ✅ **Correct branding** - "Float Walk" instead of "FootWear Pro"

## Testing Checklist

- [ ] Login page shows "Float Walk"
- [ ] Invoice form has date field with today's date
- [ ] Date can be changed by user
- [ ] GST toggle works (Non-GST ↔ GST Bill)
- [ ] When Non-GST selected:
  - [ ] GST dropdown is hidden
  - [ ] GST not shown in subtotal
  - [ ] Print view doesn't show GST
- [ ] Number inputs don't show arrows (Qty, Price, Advance)
- [ ] Default status is "paid" for new invoices
- [ ] Logo error shows fallback letter with background color
- [ ] Invoice saves with selected date

## Files Modified
- ✅ `src/pages/Login.tsx` - Company name
- ✅ `src/pages/InvoiceForm.tsx` - Date, GST toggle, number inputs, default status
- ✅ `src/components/layout/SimpleSidebar.tsx` - Logo error handling
- ✅ `src/pages/SettingsNew.tsx` - Logo error handling
- ✅ `src/components/shared/InvoicePrintContent.tsx` - Already handles non-GST (no changes needed)

## Status
✅ All changes completed and ready to test
