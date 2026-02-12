import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/stores/dataStore';
import { InvoicePrintContent } from '@/components/shared/InvoicePrintContent';

export default function InvoicePrint() {
  const { id } = useParams();
  const { invoices, fetchInvoice } = useDataStore();
  const inv = invoices.find(i => i.id === id);

  useEffect(() => {
    if (id && (!inv || !inv.items)) {
       fetchInvoice(id);
    }
  }, [id, inv, fetchInvoice]);

  useEffect(() => {
    if (inv && inv.items?.length >= 0) {
      // Generate timestamp in DD_MM_YYYY_HH_MM_SS format
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;
      
      // Set document title for print dialog filename suggestion
      document.title = `Float_Walk_${inv.invoiceNumber}_${timestamp}`;
      
      setTimeout(() => {
        window.print();
      }, 800);
    }
  }, [inv]);

  if (!inv) return <div className="p-8 text-center text-muted-foreground">Invoice not found</div>;

  return (
    <div className="min-h-screen bg-white flex justify-center">
        <InvoicePrintContent invoice={inv} />
    </div>
  );
}
