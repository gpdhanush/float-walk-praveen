import { useDataStore, Customer } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export default function Customers() {
  const { customers, deleteCustomer } = useDataStore();
  const { language } = useSettingsStore();
  const navigate = useNavigate();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const activeCustomers = customers.filter(c => !c.deleted_at);

  const openNew = () => {
    navigate('/customers/new');
  };

  const openEdit = (c: Customer) => {
    navigate(`/customers/edit/${c.id}`);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCustomer(deleteId);
      toast.success('Customer deleted');
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'sno', header: 'S.No', align: 'center' as const, width: '100px', render: (_: any, i: number) => i + 1 },
    { key: 'name', header: t('name', language), align: 'left' as const },
    { key: 'mobile', header: t('mobile', language) },
    { key: 'address', header: t('address', language), align: 'left' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('customers', language)}</h1>
        <Button onClick={openNew} size="sm" className="rounded-[5px] bg-primary text-primary-foreground shadow-none hover:bg-primary/90">
          {t('new_customer', language)}
        </Button>
      </div>

      <DataTable
        data={activeCustomers}
        columns={columns}
        searchKeys={['name', 'mobile', 'address']}
        exportFileName="customers"
        defaultSortKey="name"
        actions={(c: Customer) => (
          <div className="flex justify-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteId(c.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <ConfirmDialog 
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This will not affect their previous invoices."
      />
    </div>
  );
}
