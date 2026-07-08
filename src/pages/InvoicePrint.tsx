import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '@/stores/dataStore';
import { InvoicePrintContent } from '@/components/shared/InvoicePrintContent';

export default function InvoicePrint() {
  const { id } = useParams();
  const { invoices, fetchInvoice } = useDataStore();
  const inv = invoices.find(i => i.id === id);
  const didSchedulePrint = useRef(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (!id) {
      setLoadState('missing');
      return;
    }
    let cancelled = false;
    didSchedulePrint.current = false;
    setLoadState('loading');

    void fetchInvoice(id, { force: true }).then((result) => {
      if (cancelled) return;
      if (!result) {
        setLoadState('missing');
        return;
      }
      setLoadState('ready');

      if (didSchedulePrint.current) return;
      didSchedulePrint.current = true;

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;

      document.title = `Float_Walk_${result.invoiceNumber}_${timestamp}`;

      window.setTimeout(() => {
        window.print();
      }, 800);
    });

    return () => {
      cancelled = true;
    };
  }, [id, fetchInvoice]);

  if (loadState === 'loading') {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading invoice…</div>
    );
  }

  if (loadState === 'missing' || !inv) {
    return (
      <div className="p-8 text-center text-muted-foreground">Invoice not found</div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <InvoicePrintContent invoice={inv} />
    </div>
  );
}
