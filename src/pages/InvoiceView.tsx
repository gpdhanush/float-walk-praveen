import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Printer, Download, MessageCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices } = useDataStore();
  const settings = useSettingsStore();
  const inv = invoices.find(i => i.id === id);

  if (!inv) return <div className="p-8 text-center text-muted-foreground">Invoice not found</div>;

  const formattedDate = (() => { try { return format(new Date(inv.date), 'dd-MMM-yyyy'); } catch { return inv.date; } })();

  const handlePrint = () => window.print();

  const handlePdf = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    const el = document.getElementById('invoice-print');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 148, 210);
    pdf.save(`${inv.invoiceNumber}.pdf`);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `${settings.storeName}\n` +
      `Invoice: ${inv.invoiceNumber}\n` +
      `Total: ₹${inv.grandTotal.toLocaleString('en-IN')}\n` +
      `Advance: ₹${inv.advancePaid.toLocaleString('en-IN')}\n` +
      `Balance: ₹${inv.balanceDue.toLocaleString('en-IN')}\n` +
      `Date: ${formattedDate}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 no-print">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}><ArrowLeft className="w-4 h-4" /></Button>
        <h1 className="font-display text-xl font-bold flex-1">{inv.invoiceNumber}</h1>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2"><Printer className="w-4 h-4" />{t('print', settings.language)}</Button>
        <Button variant="outline" size="sm" onClick={handlePdf} className="gap-2"><Download className="w-4 h-4" />{t('download_pdf', settings.language)}</Button>
        <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-2"><MessageCircle className="w-4 h-4" />{t('share_whatsapp', settings.language)}</Button>
      </div>

      <div id="invoice-print" className="bg-card border rounded-xl p-8 max-w-[148mm] mx-auto shadow-lg" style={{ minHeight: '210mm' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-primary">{settings.storeName}</h2>
            <p className="text-xs text-muted-foreground mt-1">{settings.address}</p>
            <p className="text-xs text-muted-foreground">{settings.email} | {settings.mobile}</p>
            {settings.gstNumber && <p className="text-xs text-muted-foreground">GST: {settings.gstNumber}</p>}
          </div>
          <div className="text-right">
            <h3 className="font-display text-lg font-bold text-primary">INVOICE</h3>
            <p className="text-sm font-semibold">{inv.invoiceNumber}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
              inv.status === 'paid' ? 'bg-success/20 text-success' :
              inv.status === 'partial' ? 'bg-warning/20 text-warning' :
              'bg-destructive/20 text-destructive'
            }`}>{inv.status.toUpperCase()}</span>
          </div>
        </div>

        <div className="border-t border-primary/20 mb-4" />

        {/* Bill To */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-1">BILL TO</p>
          <p className="font-semibold text-sm">{inv.customerName}</p>
          <p className="text-xs text-muted-foreground">{inv.customerMobile}</p>
          {inv.customerAddress && <p className="text-xs text-muted-foreground">{inv.customerAddress}</p>}
        </div>

        {/* Items Table */}
        <table className="w-full text-xs mb-6">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="text-left p-2 rounded-tl-md">DESCRIPTION</th>
              <th className="text-center p-2">QTY</th>
              <th className="text-right p-2">PRICE</th>
              <th className="text-right p-2 rounded-tr-md">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => (
              <tr key={i} className="border-b border-border">
                <td className="p-2">{item.productName}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                <td className="p-2 text-right">₹{item.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-48 space-y-1 text-xs">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{inv.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span>GST ({inv.gstPercent}%)</span><span>₹{inv.gstAmount.toLocaleString('en-IN')}</span></div>
          {inv.advancePaid > 0 && <div className="flex justify-between text-destructive"><span>Advance</span><span>-₹{inv.advancePaid.toLocaleString('en-IN')}</span></div>}
          <div className="flex justify-between font-bold text-sm border-t pt-2 text-primary">
            <span>Grand Total</span><span>₹{inv.balanceDue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">{t('thank_you', settings.language)}</p>
          <p className="text-[10px] text-muted-foreground/60">{t('computer_generated', settings.language)}</p>
        </div>
      </div>
    </div>
  );
}
