# Invoice Form Complete Fixes

## Issues Fixed

### 1. ✅ Keyboard Navigation for Customer Dropdown
**Issue:** Down arrow didn't keep dropdown visible and Enter didn't select

**Fix:**
- Press ↓ (Down Arrow) → Opens dropdown (stays visible)
- Press ↓ again → Focuses first item in list
- Press Enter → Selects first matching customer
- Dropdown stays open until Enter/Click/Escape

### 2. ✅ Custom Date Display Format
**Issue:** Need "dd-MMM-yyyy" format display

**Fix:**
- Date input shows native picker when clicked
- When not focused, shows formatted date overlay: "12-Feb-2026"
- Overlay disappears when editing
- Saves in YYYY-MM-DD format (database compatible)

### 3. ✅ GST Bill Must Select GST %
**Issue:** GST Bill toggle didn't enforce GST % selection

**Fix:**
- When GST Bill is enabled, automatically sets GST to 18% (default)
- If user changes toggle, updates immediately
- Default GST comes from store settings
- Non-GST Bill sets GST to 0%

### 4. ✅ Edit Invoice - Incorrect Values
**Issues:**
- Subtotal showing as "0500.00" instead of correct value
- Status and Type not saving correctly
- GST values lost on edit

**Root Cause:** Database was missing columns for `subtotal`, `gst_percent`, `gst_amount`, and `type`

**Fix:**
- **SQL Migration:** Added 4 missing columns to `invoices` table
- **Backend:** Updated repository to save/fetch these fields
- **Frontend:** Added proper logging to track data flow

## Database Changes Required

### SQL Migration
**File:** `database/add_invoice_missing_columns.sql`

```sql
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(14,2) NULL,
ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(14,2) NULL,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) NULL DEFAULT 'Invoice';
```

### New Invoice Table Structure
```sql
CREATE TABLE invoices (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(50) NULL DEFAULT 'Invoice',      ← NEW
  customer_id CHAR(36) NOT NULL,
  status ENUM('paid','pending','partial','hold'),
  total_amount DECIMAL(14,2),
  paid_amount DECIMAL(14,2),
  subtotal DECIMAL(14,2) NULL,                  ← NEW
  gst_percent DECIMAL(5,2) NULL,                ← NEW
  gst_amount DECIMAL(14,2) NULL,                ← NEW
  notes TEXT NULL,
  created_by CHAR(36),
  created_at DATETIME(3),
  updated_at DATETIME(3),
  deleted_at DATETIME(3) NULL
);
```

## Backend Changes

### File: `backend/src/domain/entities/Invoice.ts`
Added `type` property:
```typescript
export interface Invoice extends BaseEntity {
  code: string;
  type?: string; // ← NEW: Invoice, Quotation, Advance Payment
  // ... other fields
}
```

### File: `backend/src/infrastructure/db/repositories/InvoiceRepository.ts`

#### 1. Updated `create()` Method
```typescript
INSERT INTO invoices (
  id, code, customer_id, status, type,           ← type added
  total_amount, paid_amount, 
  subtotal, gst_percent, gst_amount,             ← GST fields added
  notes, created_by
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

#### 2. Updated `findById()` Method
```typescript
SELECT 
  i.type,                                        ← type added
  i.subtotal,                                    ← subtotal added
  i.gst_percent AS gstPercent,                   ← gst added
  i.gst_amount AS gstAmount,                     ← gst added
  // ... other fields
FROM invoices i
```

#### 3. Updated `list()` Method
Same SELECT query changes as findById()

#### 4. Updated `update()` Method
```typescript
const map: Record<string, string> = {
  status: 'status',
  type: 'type',                 ← NEW
  subtotal: 'subtotal',         ← NEW
  gstPercent: 'gst_percent',    ← NEW
  gstAmount: 'gst_amount',      ← NEW
  totalAmount: 'total_amount',
  paidAmount: 'paid_amount',
  notes: 'notes',
};

// Removed from ignoredFields: type, subtotal, gstPercent, gstAmount
```

## Frontend Changes

### File: `src/pages/InvoiceForm.tsx`

#### 1. Keyboard Navigation Enhancement
```tsx
<Input 
  onKeyDown={e => {
    if (e.key === 'ArrowDown') {
      // Opens dropdown
    }
    if (e.key === 'Enter' && customerSearchOpen) {
      // Selects first customer
    }
  }}
/>
```

#### 2. Date Display Format
```tsx
<div className="relative">
  <Input type="date" value={invoiceDate} />
  {invoiceDate && (
    <div className="absolute right-3 ...">
      {format(new Date(invoiceDate), 'dd-MMM-yyyy')}
    </div>
  )}
</div>
```

#### 3. GST Default Enforcement
```tsx
useEffect(() => {
  if (isGstBill && gst === 0 && !isEditMode) {
    setGst(gstPercent || 18); // Default to 18%
  }
}, [isGstBill, gst, gstPercent, isEditMode]);
```

#### 4. Include Type in Update
```tsx
await updateInvoice(id, {
  status,
  type,        // ← NOW INCLUDED
  subtotal,
  gstPercent: gst,
  gstAmount,
  // ... other fields
});
```

## Migration Steps

### Step 1: Run SQL Migration
```bash
# Open phpMyAdmin
# Select your database
# Run: database/add_invoice_missing_columns.sql
```

### Step 2: Restart Backend
```bash
cd backend
# Press Ctrl+C
npm run dev
```

### Step 3: Test

#### Test Create Invoice
1. Create new invoice
2. Select type: Quotation
3. Enable GST Bill
4. Add items
5. Save
6. **Verify:** Type shows as "QUOTATION" ✅

#### Test Edit Invoice
1. Open existing invoice for edit
2. **Verify values load correctly:**
   - ✅ Subtotal shows correct amount (not "0500.00")
   - ✅ GST % shows correct value
   - ✅ Status shows correct value
   - ✅ Type shows correct value (Invoice/Quotation/Advance)
3. Make changes
4. Save
5. **Verify changes persist**

#### Test Date Display
1. Create new invoice
2. Date field shows: "12-Feb-2026" when not editing
3. Click to edit → Native date picker appears
4. Select date → Formatted display returns

#### Test Keyboard Navigation
1. Click mobile field
2. Type partial number
3. Press ↓ → Dropdown opens
4. Press ↓ → First item highlights
5. Press Enter → Customer selected ✅

#### Test GST Enforcement
1. Create new invoice
2. Toggle GST Bill ON
3. **Verify:** GST % automatically set to 18%
4. Can change to 5%, 12%, 18%, 28%
5. Toggle GST Bill OFF
6. **Verify:** GST set to 0%

## Files Modified

### Backend
- ✅ `backend/src/domain/entities/Invoice.ts` - Added type field
- ✅ `backend/src/infrastructure/db/repositories/InvoiceRepository.ts` - Full CRUD updates

### Frontend
- ✅ `src/pages/InvoiceForm.tsx` - All fixes implemented

### Database
- ✅ `database/add_invoice_missing_columns.sql` - Migration script

## Summary of Data Flow

### Create Invoice
```
Frontend → Backend → Database
{
  type: 'Quotation',
  subtotal: 5000,
  gstPercent: 18,
  gstAmount: 900,
  totalAmount: 5900,
  paidAmount: 1000,
  status: 'partial'
}

Database stores all values ✅
```

### Edit Invoice
```
Database → Backend → Frontend
{
  type: 'Quotation',      ← Loaded correctly
  subtotal: 5000,         ← Loaded correctly  
  gstPercent: 18,         ← Loaded correctly
  gstAmount: 900,         ← Loaded correctly
  status: 'partial'       ← Loaded correctly
}

User edits values

Frontend → Backend → Database
All changes saved ✅
```

## Validation Rules

### GST Bill = ON
- ✅ GST % must be selected (default 18%)
- ✅ GST % dropdown visible
- ✅ GST amount calculated automatically
- ✅ Shown in subtotal summary
- ✅ Shown in print view

### GST Bill = OFF
- ✅ GST % set to 0
- ✅ GST % dropdown hidden
- ✅ GST amount = 0
- ✅ Hidden in subtotal summary
- ✅ Hidden in print view

## Expected Behavior

### Quotation Example
```
Type: Quotation
Code: QUO-001
Items: 
  - Shoes: 1 × ₹5000 = ₹5000
GST Bill: ON (18%)
Subtotal: ₹5000
GST (18%): ₹900
Grand Total: ₹5900
Advance: ₹1000
Balance: ₹4900
Status: Partial
```

**Print Header Shows:**
```
┌────────────────────────────────┐
│ [QUOTATION]        QUO-001     │
│ QUOTATION FOR                  │
│ Customer Name                  │
└────────────────────────────────┘
```

### Invoice Example  
```
Type: Invoice
Code: INV-001
Items:
  - Boots: 2 × ₹3000 = ₹6000
GST Bill: OFF
Subtotal: ₹6000
Grand Total: ₹6000
Advance: ₹6000
Balance: ₹0
Status: Paid
```

**Print Header Shows:**
```
┌────────────────────────────────┐
│ [INVOICE]          INV-001     │
│ BILL TO                        │
│ Customer Name                  │
└────────────────────────────────┘
```
(No GST Number in header for Non-GST bills)

## Testing Checklist

- [ ] Run SQL migration
- [ ] Restart backend
- [ ] Create new Invoice - saves correctly
- [ ] Create new Quotation - saves correctly
- [ ] Create new Advance Payment - saves correctly
- [ ] Edit existing invoice - loads all values correctly
- [ ] Edit and save - changes persist
- [ ] Date shows formatted display (dd-MMM-yyyy)
- [ ] GST Bill toggle enforces 18% default
- [ ] Keyboard: ↓ → Enter selects customer
- [ ] Print shows correct type (Invoice/Quotation/Advance)
- [ ] Print hides GST for Non-GST bills

## Status
✅ All fixes completed
⚠️ **IMPORTANT:** Run SQL migration before testing!
