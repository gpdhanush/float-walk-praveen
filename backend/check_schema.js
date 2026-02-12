import { pool } from './src/infrastructure/db/pool.js';

async function checkSchema() {
  try {
    console.log('Checking invoice_items table...');
    const [columns] = await pool.execute('SHOW COLUMNS FROM invoice_items');
    console.log('Columns in invoice_items:');
    console.table(columns);
    
    console.log('Checking invoices table...');
    const [invCols] = await pool.execute('SHOW COLUMNS FROM invoices');
    console.log('Columns in invoices:');
    console.table(invCols);

    process.exit(0);
  } catch (e) {
    console.error('Error checking schema:', e);
    process.exit(1);
  }
}

checkSchema();
