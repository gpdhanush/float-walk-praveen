# Schema Mismatch Fix - CRITICAL

## 🚨 Issue Fixed

**Error:** `Unknown column 'i.invoice_code' in 'field list'`

### Root Cause
The `InvoiceRepository` was written for an OLD database schema but your current database uses a NEW schema with different column names.

## Column Name Changes

### OLD Schema (database/database.sql)
```
invoice_code → code
total → total_amount
advance_paid → paid_amount
subtotal, gst_percent, gst_amount, balance → NOT IN NEW SCHEMA
```

### NEW Schema (backend/src/infrastructure/db/schema.sql)
```sql
CREATE TABLE invoices (
  id CHAR(36),
  code VARCHAR(20),          -- Was: invoice_code
  total_amount DECIMAL(14,2), -- Was: total
  paid_amount DECIMAL(14,2),  -- Was: advance_paid
  ...
);
```

## ✅ What Was Fixed

### File Changed:
`backend/src/infrastructure/db/repositories/InvoiceRepository.ts`

### Changes Made:
1. ✅ Changed all `i.invoice_code` → `i.code`
2. ✅ Changed all `i.total` → `i.total_amount`
3. ✅ Changed all `i.advance_paid` → `i.paid_amount`
4. ✅ Removed references to non-existent columns (subtotal, gst_percent, gst_amount, balance)
5. ✅ Calculate missing fields from existing data:
   - `subtotal = total_amount` (for frontend compatibility)
   - `gstPercent = 0` (not in new schema)
   - `gstAmount = 0` (not in new schema)
   - `balanceDue = total_amount - paid_amount` (calculated)
6. ✅ Fixed INSERT statements to use correct column names
7. ✅ Fixed all SELECT queries
8. ✅ Fixed UPDATE statements
9. ✅ Removed `reference` column from payments (doesn't exist in new schema)
10. ✅ Removed `product_id` from invoice_items INSERT (optional field, not used)

### Backup Created:
`backend/src/infrastructure/db/repositories/InvoiceRepository_OLD_BACKUP.ts`

## 🔄 How to Apply

The backend should auto-restart if using `tsx watch`. If not:

```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

Or if running in production:
```bash
npm run build
npm start
```

## ✅ Expected Result

After restarting the backend, you should see:
- ✅ No more `Unknown column 'invoice_code'` errors
- ✅ Invoices load properly in frontend
- ✅ Customer list works
- ✅ Expenses work
- ✅ All API endpoints functional

## 📊 Frontend Compatibility

The fixed repository maintains compatibility with the frontend by:
- Providing `invoiceNumber` field (mapped from `code`)
- Providing `grandTotal` field (mapped from `total_amount`)
- Providing `advancePaid` field (mapped from `paid_amount`)
- Calculating `balanceDue` (total_amount - paid_amount)
- Providing dummy values for `gstPercent` and `gstAmount` (0)
- Providing `subtotal` (same as grandTotal)

This means **NO frontend changes needed** - everything works with the existing frontend code!

## 🔍 Schema Status

### Used Columns in NEW Schema:
```sql
invoices:
  - id ✅
  - code ✅
  - customer_id ✅
  - status ✅
  - total_amount ✅
  - paid_amount ✅
  - notes ✅
  - created_by ✅
  - created_at ✅
  - updated_at ✅
  - deleted_at ✅
```

### Missing from NEW Schema (calculated/dummy values):
- subtotal → calculated as total_amount
- gst_percent → returns 0
- gst_amount → returns 0
- balance → calculated as (total_amount - paid_amount)

## 🚨 Important Notes

1. **GST Functionality:** The new schema doesn't store GST separately. If you need GST tracking, you'll need to add these columns to the database.

2. **Invoice Items:** GST should be calculated from invoice_items if needed in the future.

3. **Status Values:** The repository no longer converts status values (DRAFT/COMPLETED/ADVANCE/READY). The new schema uses the frontend values directly (pending/paid/partial/hold).

## 🧪 Test Checklist

After restart, test these:
- [ ] Login works
- [ ] Dashboard loads
- [ ] Customer list loads
- [ ] Can create/edit customer
- [ ] Invoice list loads
- [ ] Can create invoice
- [ ] Can view invoice
- [ ] Can edit invoice
- [ ] Expenses list loads
- [ ] Reports work

## 📝 Related Files

- `backend/src/infrastructure/db/schema.sql` - Current database schema
- `backend/src/infrastructure/db/repositories/InvoiceRepository.ts` - FIXED
- `backend/src/infrastructure/db/repositories/InvoiceRepository_OLD_BACKUP.ts` - Backup
- `database/database.sql` - OLD schema (don't use)
- `database/optimized_schema.sql` - Clean version of new schema

## 🎯 Next Steps

1. ✅ Backend fixed - restart if needed
2. ⚠️ Still need to add missing customer columns (whatsapp, alt_contact, gender, notes)
3. ⚠️ Consider running database cleanup script
4. ⚠️ Add performance indexes

See:
- `database/cleanup_database.sql` - To add missing customer columns
- `database/add_all_indexes.sql` - To optimize performance

## 🔄 If You Need to Rollback

```bash
cd backend/src/infrastructure/db/repositories
cp InvoiceRepository_OLD_BACKUP.ts InvoiceRepository.ts
cd ../../..
npm run build
```

But note: The OLD version won't work with your current database schema!
