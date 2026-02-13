# Print Invoice Filename Update

## Change Summary
Updated invoice PDF/print filename format to include company name and timestamp.

## New Filename Format
```
Float_Walk_{InvoiceNumber}_{DD_MM_YYYY_HH_MM_SS}.pdf
```

### Examples

**Invoice:**
```
Float_Walk_INV-001_12_02_2026_14_30_45.pdf
```

**Quotation:**
```
Float_Walk_QUO-001_12_02_2026_15_20_30.pdf
```

**Advance Payment:**
```
Float_Walk_ADV-001_12_02_2026_16_45_15.pdf
```

## Technical Details

### Timestamp Format
- **DD**: Day (01-31)
- **MM**: Month (01-12)
- **YYYY**: Year (2026)
- **HH**: Hour in 24-hour format (00-23)
- **MM**: Minutes (00-59)
- **SS**: Seconds (00-59)

All components are zero-padded to 2 digits (except year which is 4 digits).

### Implementation

#### 1. PDF Download (InvoiceView.tsx)
**File:** `src/pages/InvoiceView.tsx`

Updated the `handlePdf` function to generate timestamp and format filename:

```tsx
const handlePdf = async () => {
  // ... html2canvas and jsPDF setup ...
  
  // Generate timestamp
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;
  
  // Save with new format
  pdf.save(`Float_Walk_${inv.invoiceNumber}_${timestamp}.pdf`);
};
```

#### 2. Browser Print (InvoicePrint.tsx)
**File:** `src/pages/InvoicePrint.tsx`

Updated to set `document.title` before triggering print dialog:

```tsx
useEffect(() => {
  if (inv && inv.items?.length >= 0) {
    // Generate timestamp
    const now = new Date();
    const timestamp = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;
    
    // Set document title (used as default filename in print dialog)
    document.title = `Float_Walk_${inv.invoiceNumber}_${timestamp}`;
    
    setTimeout(() => {
      window.print();
    }, 800);
  }
}, [inv]);
```

## Benefits

1. ✅ **Organized Files**: Company name prefix groups all invoices together
2. ✅ **Unique Filenames**: Timestamp ensures no overwrites
3. ✅ **Easy Sorting**: Format allows chronological sorting
4. ✅ **Professional**: Branded with company name
5. ✅ **Searchable**: Can search by invoice number or date
6. ✅ **No Conflicts**: Multiple downloads of same invoice won't overwrite

## File Naming Pattern

### Before
```
INV-001.pdf
QUO-002.pdf
ADV-003.pdf
```

### After
```
Float_Walk_INV-001_12_02_2026_14_30_45.pdf
Float_Walk_QUO-002_12_02_2026_15_20_30.pdf
Float_Walk_ADV-003_12_02_2026_16_45_15.pdf
```

## Testing

### Test PDF Download
1. Open any invoice view page
2. Click "Download PDF" button
3. Check downloaded file name format

**Expected:** `Float_Walk_INV-XXX_DD_MM_YYYY_HH_MM_SS.pdf`

### Test Browser Print
1. Open invoice print page (or click Print button)
2. Browser print dialog opens
3. Check default filename suggestion

**Expected:** `Float_Walk_INV-XXX_DD_MM_YYYY_HH_MM_SS`

### Test Different Invoice Types
- [ ] Regular Invoice (INV-XXX)
- [ ] Quotation (QUO-XXX)
- [ ] Advance Payment (ADV-XXX)

All should follow the same naming pattern.

## Files Modified
- ✅ `src/pages/InvoiceView.tsx` - PDF download filename
- ✅ `src/pages/InvoicePrint.tsx` - Browser print filename

## Status
✅ Completed and ready to test
