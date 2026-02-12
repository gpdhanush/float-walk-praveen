import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { invoices, customers, products } = useDataStore();
  const { language } = useSettingsStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayInvoices = invoices.filter(i => i.date === today);
  const todayRevenue = todayInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalSales = invoices.reduce((s, i) => s + i.grandTotal, 0);
  const pendingBalance = invoices.reduce((s, i) => s + i.balanceDue, 0);
  const lowStockProducts = products.filter(p => !p.deleted_at && p.stock <= p.lowStockThreshold);

  const cards = [
    { label: t('today_revenue', language), value: `₹${todayRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success' },
    { label: t('total_sales', language), value: `₹${totalSales.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-info' },
    { label: t('pending_balance', language), value: `₹${pendingBalance.toLocaleString('en-IN')}`, icon: Clock, color: 'text-warning' },
    { label: t('invoices', language), value: invoices.length.toString(), icon: FileText, color: 'text-primary' },
  ];

  const recentInvoices = [...invoices].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('dashboard', language)}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold font-display mt-1">{c.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t('recent_invoices', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{inv.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹{inv.grandTotal.toLocaleString('en-IN')}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        inv.status === 'paid' ? 'bg-success/20 text-success' :
                        inv.status === 'partial' ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t('low_stock', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">All products are well stocked</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                    </div>
                    <span className="text-sm font-semibold text-destructive">{p.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
