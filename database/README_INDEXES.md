# Database Indexes Guide

## Schema Information

This project uses **TWO different database schemas**:

1. **`database/database.sql`** - Legacy schema (simpler, older structure)
2. **`backend/src/infrastructure/db/schema.sql`** - Current schema (includes most indexes already)

## Which Schema Are You Using?

Check your database to see which schema is active:

```sql
-- Run this query to check:
SHOW TABLES;

-- If you see columns with underscores (created_at, updated_at), you're using the NEW schema
-- If you see columns without (invoice_code), you're using the OLD schema

-- Or check the invoices table structure:
DESCRIBE invoices;
```

### New Schema (backend/src/infrastructure/db/schema.sql)
- Column: `code` (not invoice_code)
- Column: `total_amount` (not total)
- Column: `paid_amount` (not advance_paid)
- **Most indexes already included**

### Old Schema (database/database.sql)
- Column: `invoice_code` (not code)
- Column: `total` (not total_amount)
- Column: `advance_paid` (not paid_amount)
- **Needs manual indexes**

## How to Add Indexes

### Option 1: Safe Version (Recommended)

Use the safe version that skips already-existing indexes:

```bash
mysql -u root -p floatwalk_billing < database/add_indexes_safe.sql
```

### Option 2: Manual (Old Schema Only)

If using the OLD schema (database/database.sql), run:

```bash
mysql -u root -p floatwalk_billing < database/add_indexes.sql
```

**Note:** This may give errors if you're using the NEW schema.

### Option 3: Using the Backend Schema (Recommended)

The backend schema already includes optimal indexes. To use it:

```bash
# This creates tables with all necessary indexes
mysql -u root -p floatwalk_billing < backend/src/infrastructure/db/schema.sql
```

## Error: "Key column doesn't exist"

If you get an error like:
```
#1072 - Key column 'payment_date' doesn't exist in table
```

**Solution:**
1. You're using the NEW schema which has different column names
2. Use `add_indexes_safe.sql` instead
3. Or comment out the problematic line in `add_indexes.sql`

## Verify Indexes Were Created

After running the index script, verify:

```sql
-- Check invoices table indexes
SHOW INDEX FROM invoices;

-- Check customers table indexes
SHOW INDEX FROM customers;

-- Check payments table indexes
SHOW INDEX FROM payments;

-- Check all tables
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'floatwalk_billing'
ORDER BY TABLE_NAME, INDEX_NAME;
```

## Expected Indexes (New Schema)

### Invoices Table
- `PRIMARY` on id
- `idx_invoices_customer` on customer_id
- `idx_invoices_status` on status
- `idx_invoices_created` on created_at
- `idx_invoices_deleted` on deleted_at
- `code` (UNIQUE)

### Customers Table
- `PRIMARY` on id
- `idx_customers_mobile` on mobile (UNIQUE)
- `idx_customers_deleted` on deleted_at

### Payments Table
- `PRIMARY` on id
- `idx_payments_invoice` on invoice_id

### Invoice Items Table
- `PRIMARY` on id
- `idx_invoice_items_invoice` on invoice_id

### Expenses Table
- `PRIMARY` on id
- `idx_expenses_date` on expense_date
- `idx_expenses_deleted` on deleted_at
- `code` (UNIQUE)

## Performance Testing

After adding indexes, test query performance:

```sql
-- Test invoice lookup by customer
EXPLAIN SELECT * FROM invoices WHERE customer_id = 'some-uuid';

-- Test invoice status filtering
EXPLAIN SELECT * FROM invoices WHERE status = 'pending';

-- Test customer search by mobile
EXPLAIN SELECT * FROM customers WHERE mobile = '9876543210';

-- Test payment lookup by invoice
EXPLAIN SELECT * FROM payments WHERE invoice_id = 'some-uuid';
```

Look for:
- `type: ref` or `type: const` (good - using index)
- `key: idx_...` (shows which index is used)
- Avoid `type: ALL` (bad - full table scan)

## Migration from Old to New Schema

If you're using the OLD schema and want to migrate to the NEW schema:

⚠️ **WARNING: This will drop and recreate all tables. Backup first!**

```bash
# 1. Backup your data first!
mysqldump -u root -p floatwalk_billing > backup_$(date +%Y%m%d).sql

# 2. Drop existing tables
mysql -u root -p floatwalk_billing -e "DROP DATABASE floatwalk_billing; CREATE DATABASE floatwalk_billing;"

# 3. Load new schema
mysql -u root -p floatwalk_billing < backend/src/infrastructure/db/schema.sql

# 4. Restore your data (you'll need to adjust column names)
# This step requires manual mapping due to column name changes
```

## Troubleshooting

### "Index already exists"
✅ This is fine! MySQL will skip creating duplicate indexes.

### "Table doesn't exist"
❌ Check which schema you're using. You may need to run the schema.sql first.

### "Column doesn't exist"
❌ You're running an index script meant for a different schema version. Use `add_indexes_safe.sql`.

### Slow queries even with indexes
Check if indexes are being used:
```sql
SHOW INDEX FROM your_table;
EXPLAIN your_slow_query;
```

## Best Practices

1. ✅ Always use the backend schema for new installations
2. ✅ Run EXPLAIN on slow queries to verify index usage
3. ✅ Add indexes on foreign keys
4. ✅ Add indexes on frequently filtered columns (status, dates)
5. ✅ Add indexes on frequently searched columns (mobile, email)
6. ❌ Don't over-index (every index slows down writes)
7. ❌ Don't index low-cardinality columns (gender, boolean)
8. ❌ Don't index very large text columns

## Need Help?

If you're still experiencing slow queries:
1. Check which schema you're using
2. Verify indexes exist (SHOW INDEX)
3. Test query with EXPLAIN
4. Check table sizes (SELECT COUNT(*) FROM table)
5. Consider database server configuration (my.cnf)
