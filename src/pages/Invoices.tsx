import { useState } from 'react';
import { useDataStore, Invoice } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, Pencil, Trash2, Printer, ArrowRightLeft } from 'lucide-react';
import { toast } from '../components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageTitle } from '@/components/shared/PageTitle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Invoices() {
  const { invoices, deleteInvoice, convertAdvanceToInvoice } = useDataStore();
  const { language } = useSettingsStore();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteInvoice(deleteId);
      setDeleteId(null);
      toast.success('Invoice deleted');
    }
  };

  const handleConvertAdvance = async (invoice: Invoice) => {
    try {
      await convertAdvanceToInvoice(invoice.id);
      toast.success('Advance converted to invoice');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to convert advance');
    }
  };

  // Format date as dd-MMM-yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Sort invoices by date in descending order (newest first)
  const sortedInvoices = [...invoices].sort((a, b) => {
    const dateA = new Date(a.created_at || a.date).getTime();
    const dateB = new Date(b.created_at || b.date).getTime();
    return dateB - dateA; // Descending order
  });

  const columns = [
    { key: 'sno', header: 'S.No', render: (_: Invoice, index: number) => index + 1 },
    { key: 'invoiceNumber', header: 'Invoice #' },
    { 
      key: 'created_at', 
      header: t('date', language), 
      render: (i: Invoice) => formatDate(i.created_at || i.date)
    },
    { key: 'customerName', header: 'Customer', align: 'left' as const },
    { key: 'grandTotal', header: t('total', language), render: (i: Invoice) => `₹${Number(i.totalAmount || i.grandTotal || 0).toLocaleString('en-IN')}` },
    { key: 'balanceDue', header: t('balance', language), render: (i: Invoice) => {
      const total = Number(i.totalAmount || i.grandTotal || 0);
      const paid = Number(i.paidAmount || i.advancePaid || 0);
      return `₹${(total - paid).toLocaleString('en-IN')}`;
    }},
    {
      key: 'status', header: t('status', language), render: (i: Invoice) => {
        const displayStatus = i.status || 'pending';

        return (
        <Badge className="rounded-[5px] px-1.5 py-0 text-[10px] leading-4" variant={
          displayStatus === 'paid' ? 'default' : 
          displayStatus === 'partial' ? 'secondary' : 
          displayStatus === 'hold' ? 'outline' : 'destructive'
        }>
          {displayStatus.toUpperCase()}
        </Badge>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle>{t('invoices', language)}</PageTitle>
        <Button onClick={() => navigate('/invoices/new')} size="sm" className="rounded-[5px] bg-primary text-primary-foreground shadow-none hover:bg-primary/90">
          {t('new_invoice', language)}
        </Button>
      </div>

      <DataTable data={sortedInvoices} columns={columns} searchKeys={['invoiceNumber', 'customerName']} exportFileName="invoices"
        actions={(inv: Invoice) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/invoice/${inv.id}`)}>
                <Eye className="w-4 h-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/invoices/edit/${inv.id}`)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              {inv.type === 'Advance Payment' && (
                <DropdownMenuItem onClick={() => void handleConvertAdvance(inv)}>
                  <ArrowRightLeft className="w-4 h-4 mr-2" /> Close as Invoice
                </DropdownMenuItem>
              )}
              {/* Print just navigates to view which has print, or we could open window.print() after nav? 
                  User said "print only invoice content". The View page is best for this. */}
              <DropdownMenuItem onClick={() => window.open(`/invoice/print/${inv.id}`, '_blank')}>
                <Printer className="w-4 h-4 mr-2" /> Print
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
                onClick={() => setDeleteId(inv.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <ConfirmDialog 
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        description="This action cannot be undone. This will permanently delete the invoice."
      />
    </div>
  );
}
