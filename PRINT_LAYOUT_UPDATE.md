# Invoice Print Layout Update

## Changes Made

Updated the invoice print header to show complete store information and conditionally display GST number only for GST bills.

## New Print Header Layout

### Structure
```
┌─────────────────────────────────────────────────────┐
│  [LOGO]    Store Name                     INVOICE   │
│            Address                         INV-001   │
│            Mobile | Office Mobile          Date      │
│            Email                           Status    │
│            GSTIN: XXX (only if GST bill)            │
└─────────────────────────────────────────────────────┘
```

### Display Logic

#### Logo Display
- ✅ Shows uploaded logo if available
- ✅ Falls back to store name's first letter in colored circle if logo fails
- ✅ Professional bordered design

#### Store Information (Always Shown)
1. **Store Name** - Large, bold, primary color
2. **Address** - Full address on one or more lines
3. **Contact Numbers** - Format: `Mobile | Office Mobile`
   - Only shows office mobile if different from mobile
4. **Email** - Displayed if available

#### GST Number (Conditional)
- ✅ **Only shown if GST bill** (`gstAmount > 0` or `gstPercent > 0`)
- ✅ **Hidden for Non-GST bills**
- Badge style with "GSTIN" label

## Technical Implementation

### File Modified
`src/components/shared/InvoicePrintContent.tsx`

### Key Changes

#### 1. Added GST Bill Detection
```tsx
const isGstBill = (inv.gstAmount || 0) > 0 || (inv.gstPercent || 0) > 0;
```

#### 2. Updated Logo Display with Error Handling
```tsx
const fullLogoUrl = getLogoUrl(settings.logoUrl);
const [logoError, setLogoError] = useState(false);

{fullLogoUrl && !logoError ? (
  <img 
    src={fullLogoUrl} 
    onError={() => setLogoError(true)}
  />
) : (
  // Fallback letter circle
  <span>{settings.storeName?.charAt(0)?.toUpperCase()}</span>
)}
```

#### 3. Enhanced Contact Information
```tsx
<p className="text-[11px] text-muted-foreground font-medium">
  {settings.mobile}
  {settings.phone && settings.phone !== settings.mobile && ` | ${settings.phone}`}
</p>
{settings.email && <p className="text-[11px] text-muted-foreground">{settings.email}</p>}
```

#### 4. Conditional GST Display
```tsx
{isGstBill && settings.gstNumber && (
  <div className="mt-1 flex items-center gap-1.5">
    <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
      GSTIN
    </span>
    <span className="text-[10px] font-semibold text-muted-foreground">
      {settings.gstNumber}
    </span>
  </div>
)}
```

## Examples

### GST Bill Print Header
```
┌─────────────────────────────────────────────────────┐
│  [LOGO]    Float Walk                      INVOICE  │
│            123 Main Street, Chennai        INV-001  │
│            +91 98765 43210 | +91 87654 32109        │
│            info@floatwalk.com              12-Feb-26│
│            GSTIN: 33XXXXX1234X1ZX          Paid     │
└─────────────────────────────────────────────────────┘
```

### Non-GST Bill Print Header
```
┌─────────────────────────────────────────────────────┐
│  [LOGO]    Float Walk                      INVOICE  │
│            123 Main Street, Chennai        INV-001  │
│            +91 98765 43210 | +91 87654 32109        │
│            info@floatwalk.com              12-Feb-26│
│                                            Paid     │
└─────────────────────────────────────────────────────┘
```
(Note: No GSTIN line for Non-GST bills)

## Benefits

1. ✅ **Complete Contact Info** - All ways to reach the business
2. ✅ **Professional Layout** - Clean, organized header
3. ✅ **Smart GST Display** - Only shows when relevant
4. ✅ **Error Resilient** - Graceful logo fallback
5. ✅ **Print Optimized** - Proper spacing and font sizes

## Testing

### Test GST Bill
1. Create invoice with GST enabled
2. Print or download PDF
3. Verify:
   - [ ] Logo displays correctly
   - [ ] Store name, address shown
   - [ ] Both mobile numbers shown
   - [ ] Email displayed
   - [ ] **GST number is visible**

### Test Non-GST Bill
1. Create invoice with Non-GST toggle
2. Print or download PDF
3. Verify:
   - [ ] Logo displays correctly
   - [ ] Store name, address shown
   - [ ] Both mobile numbers shown
   - [ ] Email displayed
   - [ ] **GST number is HIDDEN**

### Test Logo Fallback
1. Set invalid logo URL in database
2. Print invoice
3. Verify:
   - [ ] Shows store name first letter in colored circle
   - [ ] No broken image icon

## Store Settings Used

The print header uses these settings:
- `storeName` - Business name
- `address` - Full address
- `mobile` - Primary mobile number
- `phone` - Office/alternate mobile number
- `email` - Contact email
- `logoUrl` - Logo image path
- `gstNumber` - GST registration number

Make sure all are configured in Settings page.

## Print Specifications

### Font Sizes
- Store Name: `text-2xl` (24px)
- Address/Contact: `text-[11px]` (11px)
- Email: `text-[11px]` (11px)
- GST Badge: `text-[9px]` (9px)
- GST Number: `text-[10px]` (10px)

### Logo Size
- Dimensions: 96x96px (w-24 h-24)
- Border radius: 0.75rem (rounded-2xl)
- Border: 1px primary color at 10% opacity

### Spacing
- Logo to text gap: 1.25rem (gap-5)
- Line spacing: 0.125rem (space-y-0.5)
- Section margin bottom: 2rem (mb-8)

## Files Modified
- ✅ `src/components/shared/InvoicePrintContent.tsx`

## Status
✅ Completed and ready to test
