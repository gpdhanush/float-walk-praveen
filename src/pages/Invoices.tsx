import { useState } from 'react';
import { useDataStore, Invoice } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, Eye, Pencil, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Invoices() {
  const { invoices, deleteInvoice } = useDataStore();
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
    { key: 'invoiceNumber', header: 'Invoice #' },
    { 
      key: 'created_at', 
      header: t('date', language), 
      render: (i: Invoice) => formatDate(i.created_at || i.date)
    },
    { key: 'customerName', header: 'Customer' },
    { key: 'grandTotal', header: t('total', language), render: (i: Invoice) => `₹${Number(i.totalAmount || i.grandTotal || 0).toLocaleString('en-IN')}` },
    { key: 'balanceDue', header: t('balance', language), render: (i: Invoice) => {
      const total = Number(i.totalAmount || i.grandTotal || 0);
      const paid = Number(i.paidAmount || i.advancePaid || 0);
      return `₹${(total - paid).toLocaleString('en-IN')}`;
    }},
    {
      key: 'status', header: t('status', language), render: (i: Invoice) => (
        <Badge variant={
          i.status === 'paid' ? 'default' : 
          i.status === 'partial' ? 'secondary' : 
          i.status === 'hold' ? 'outline' : 'destructive'
        }>
          {(i.status || 'pending').toUpperCase()}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('invoices', language)}</h1>
        <Button onClick={() => navigate('/invoices/new')} className="gap-2">
          <Plus className="w-4 h-4" />{t('new_invoice', language)}
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
              {/* Print just navigates to view which has print, or we could open window.print() after nav? 
                  User said "print only invoice content". The View page is best for this. */}
              <DropdownMenuItem onClick={() => window.open(`/invoice/print/${inv.id}`, '_blank')}>
                <Printer className="w-4 h-4 mr-2" /> Print
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(inv.id)}>
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
