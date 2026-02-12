import { useDataStore, Customer } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
    { key: 'sno', header: 'S.No', render: (_: any, i: number) => i + 1 },
    { key: 'name', header: t('name', language) },
    { key: 'mobile', header: t('mobile', language) },
    { key: 'email', header: t('email', language) },
    { key: 'address', header: t('address', language) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('customers', language)}</h1>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('new_customer', language)}
        </Button>
      </div>

      <DataTable
        data={activeCustomers}
        columns={columns}
        searchKeys={['name', 'mobile', 'email']}
        exportFileName="customers"
        actions={(c: Customer) => (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
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
