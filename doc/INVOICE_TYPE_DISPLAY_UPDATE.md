# Invoice Type Display Update

## Change Summary
Updated the invoice print layout to dynamically show the appropriate label based on invoice type.

## Print Header Labels

### Before
All invoices showed:
```
BILL TO
```

### After
Dynamic based on invoice type:

| Invoice Type      | Label Shown              |
|-------------------|--------------------------|
| Invoice           | BILL TO                  |
| Quotation         | QUOTATION FOR            |
| Advance Payment   | ADVANCE PAYMENT FOR      |

## Examples

### Regular Invoice
```
┌─────────────────────────────────────┐
│  [LOGO]  Float Walk      INVOICE    │
│          Address         INV-001    │
│                          Date       │
├─────────────────────────────────────┤
│  BILL TO                            │
│  Customer Name                      │
│  Mobile                             │
└─────────────────────────────────────┘
```

### Quotation
```
┌─────────────────────────────────────┐
│  [LOGO]  Float Walk    QUOTATION    │
│          Address       QUO-001      │
│                        Date         │
├─────────────────────────────────────┤
│  QUOTATION FOR                      │
│  Customer Name                      │
│  Mobile                             │
└─────────────────────────────────────┘
```

### Advance Payment
```
┌─────────────────────────────────────┐
│  [LOGO]  Float Walk  ADVANCE PAYMENT│
│          Address     ADV-001        │
│                      Date           │
├─────────────────────────────────────┤
│  ADVANCE PAYMENT FOR                │
│  Customer Name                      │
│  Mobile                             │
└─────────────────────────────────────┘
```

## Implementation

### File Modified
`src/components/shared/InvoicePrintContent.tsx`

### Code Change
```tsx
{/* Bill To / Quotation For / Advance For */}
<div className="mb-6">
  <p className="text-xs text-muted-foreground mb-1">
    {inv.type === 'Quotation' ? 'QUOTATION FOR' : 
     inv.type === 'Advance Payment' ? 'ADVANCE PAYMENT FOR' : 
     'BILL TO'}
  </p>
  <p className="font-semibold text-sm">{inv.customerName}</p>
  <p className="text-xs text-muted-foreground">{inv.customerMobile}</p>
  {inv.customerAddress && <p className="text-xs text-muted-foreground">{inv.customerAddress}</p>}
</div>
```

## Dynamic Invoice Type Badge

The badge at the top right also shows the type:
```tsx
<div className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-lg mb-4">
  <h3 className="text-xs font-bold tracking-widest uppercase">
    {inv.type || 'INVOICE'}
  </h3>
</div>
```

## Complete Print Layout

```
┌─────────────────────────────────────────────────────┐
│  [LOGO]    Store Name           [TYPE BADGE]        │
│            Address              Invoice Number      │
│            Mobile | Office      Date                │
│            Email                Status Badge        │
│            GSTIN (if GST)                           │
├─────────────────────────────────────────────────────┤
│  [TYPE-SPECIFIC LABEL]                              │
│  Customer Name                                      │
│  Mobile                                             │
│  Address                                            │
├─────────────────────────────────────────────────────┤
│  Items Table                                        │
├─────────────────────────────────────────────────────┤
│  Totals                                             │
├─────────────────────────────────────────────────────┤
│  Footer                                             │
└─────────────────────────────────────────────────────┘
```

## Testing

### Test Invoice
1. Create/edit invoice with type "Invoice"
2. Print or download PDF
3. Verify shows: **"BILL TO"**

### Test Quotation
1. Create/edit invoice with type "Quotation"
2. Print or download PDF
3. Verify shows: **"QUOTATION FOR"**

### Test Advance Payment
1. Create/edit invoice with type "Advance Payment"
2. Print or download PDF
3. Verify shows: **"ADVANCE PAYMENT FOR"**

## Benefits

1. ✅ **Clear Document Type** - Immediately obvious what type of document it is
2. ✅ **Professional** - Proper terminology for each document type
3. ✅ **Consistent** - Type badge and label match
4. ✅ **User-Friendly** - No confusion about document purpose

## Files Modified
- ✅ `src/components/shared/InvoicePrintContent.tsx`

## Status
✅ Completed and ready to test

## Quick Reference

| Type            | Badge Text        | Label Text            | Number Format |
|-----------------|-------------------|-----------------------|---------------|
| Invoice         | INVOICE           | BILL TO               | INV-001       |
| Quotation       | QUOTATION         | QUOTATION FOR         | QUO-001       |
| Advance Payment | ADVANCE PAYMENT   | ADVANCE PAYMENT FOR   | ADV-001       |
