# Backend Database Cleanup Analysis

## 📊 Current Schema Status

### ✅ USED TABLES (Keep These)
| Table | Has Repository | Has Entity | Used in Frontend | Status |
|-------|---------------|------------|------------------|---------|
| **users** | ✅ | ✅ | ✅ | ✅ Keep - Fully implemented |
| **customers** | ✅ | ✅ | ✅ | ⚠️ Keep - Missing columns |
| **store_settings** | ✅ | ✅ | ✅ | ✅ Keep - Fully implemented |
| **invoices** | ✅ | ✅ | ✅ | ✅ Keep - Fully implemented |
| **invoice_items** | ✅ | ✅ | ✅ | ⚠️ Keep - Has unused columns |
| **payments** | ❌ | ✅ | ✅ | ⚠️ Keep - No repository but used |
| **expenses** | ✅ | ✅ | ✅ | ✅ Keep - Fully implemented |
| **code_sequences** | ✅ | ❌ | ❌ | ✅ Keep - System table |

### ❌ UNUSED TABLES (Can Remove)
| Table | Has Repository | Has Entity | Used in Frontend | Reason to Remove |
|-------|---------------|------------|------------------|------------------|
| **products** | ❌ | ❌ | ❌ | Only referenced by invoice_items.product_id (nullable, never used) |
| **foot_measurements** | ❌ | ❌ | ❌ | No implementation, only code sequence exists |
| **purchases** | ❌ | ❌ | ❌ | Only used in ReportUseCases, no CRUD operations |
| **stock_logs** | ❌ | ❌ | ❌ | No implementation, only code sequence exists |

## 🔍 Column-Level Issues

### customers TABLE - MISSING COLUMNS ⚠️
**Problem:** Backend code and frontend use these columns, but schema doesn't have them!

Missing in schema.sql:
- `whatsapp` VARCHAR(20)
- `alt_contact` VARCHAR(20)
- `gender` VARCHAR(20)
- `notes` TEXT

**Used in:**
- `backend/src/infrastructure/db/repositories/CustomerRepository.ts` (lines 14, 20-25)
- `backend/src/domain/entities/Customer.ts` (lines 6-11)
- `src/pages/CustomerForm.tsx` (all fields used)

### invoice_items TABLE - UNUSED COLUMNS
- `product_id` CHAR(36) NULL - Referenced but never populated or used
- `deleted_at` DATETIME(3) NULL - Soft delete not implemented

### payments TABLE - UNUSED COLUMNS
- `reference` VARCHAR(255) NULL - Never used in code
- `deleted_at` DATETIME(3) NULL - Soft delete not implemented

## 📋 Recommended Actions

### Priority 1: FIX CUSTOMERS TABLE (CRITICAL)
**Add missing columns immediately** - Current code will fail without these!

```sql
ALTER TABLE customers 
  ADD COLUMN whatsapp VARCHAR(20) NULL AFTER mobile,
  ADD COLUMN alt_contact VARCHAR(20) NULL AFTER whatsapp,
  ADD COLUMN gender VARCHAR(20) NULL AFTER email,
  ADD COLUMN notes TEXT NULL AFTER address;
```

### Priority 2: REMOVE UNUSED TABLES
**Safe to remove** - No backend or frontend implementation exists

Tables to drop:
1. `products` - No repository, no frontend
2. `foot_measurements` - No repository, no frontend
3. `purchases` - Only in reports (can keep table but remove from code_sequences)
4. `stock_logs` - No repository, no frontend

### Priority 3: CLEAN UP UNUSED COLUMNS
**Optional** - Won't break anything but reduces database size

- Remove `invoice_items.product_id` - Never used
- Remove `invoice_items.deleted_at` - Not implemented
- Remove `payments.reference` - Never used
- Remove `payments.deleted_at` - Not implemented

### Priority 4: REMOVE UNUSED INDEXES
These indexes reference unused columns or tables

From schema.sql:
- `idx_products_name` (table will be dropped)
- `idx_products_deleted` (table will be dropped)
- `idx_foot_measurements_customer` (table will be dropped)
- `idx_foot_measurements_deleted` (table will be dropped)

## 📊 Impact Analysis

### If You Remove Unused Tables:
- **Database Size:** Reduce by ~40% (4 of 11 tables)
- **Backup Size:** Smaller backups
- **Query Performance:** Slightly faster (less table scanning)
- **Maintenance:** Easier to maintain smaller schema
- **Risk:** ✅ ZERO RISK - No code references these tables

### If You Keep Purchases Table:
**Reason:** Used in ReportUseCases for purchase reports

If you want to keep purchase reports:
1. Keep `purchases` table
2. Remove from `code_sequences` if not creating purchase records
3. Or implement full CRUD for purchases

## 🎯 Decision Matrix

| Feature | Keep? | Reason |
|---------|-------|---------|
| Products Module | ❌ | No implementation exists |
| Foot Measurements | ❌ | No implementation exists |
| Purchases Module | ⚠️ | Used in reports only - decide if you need it |
| Stock Logs | ❌ | No implementation exists |
| Customer Extra Fields | ✅ | Currently used, need to add to schema |

## 📝 Notes

1. **purchases table** is the only questionable one:
   - Used in `/api/reports` endpoint
   - But no way to create/edit purchases
   - Decision: Remove if you don't plan to implement purchase tracking

2. **code_sequences** has entries for MEA, STK, PUR:
   - MEA (Measurements) - Not used
   - STK (Stock) - Not used
   - PUR (Purchases) - Only if keeping purchases feature

3. **Soft deletes** are inconsistent:
   - Implemented: users, customers, invoices, expenses
   - Not implemented: invoice_items, payments, products, etc.
   - Consider standardizing or removing unused deleted_at columns
