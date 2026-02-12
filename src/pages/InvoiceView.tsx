import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore, Invoice } from '@/stores/dataStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Printer, Download, MessageCircle, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { InvoicePrintContent } from '@/components/shared/InvoicePrintContent';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, fetchInvoice, deleteInvoice } = useDataStore();
  const settings = useSettingsStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const inv = invoices.find(i => i.id === id);

  useEffect(() => {
    if (id && (!inv || !inv.items)) {
      fetchInvoice(id);
    }
  }, [id, inv, fetchInvoice]);

  const handleEdit = () => {
    navigate(`/invoices/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  if (!inv) return <div className="p-8 text-center text-muted-foreground">Invoice not found</div>;

  const formattedDate = (() => { try { return format(new Date(inv.date || (inv as any).createdAt), 'dd-MMM-yyyy'); } catch { return inv.date; } })();

  const handlePrint = () => window.open(`/invoice/print/${inv.id}`, '_blank');

  const handlePdf = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    const el = document.getElementById('invoice-print');
    if (!el) return;
    
    // Generate timestamp in DD_MM_YYYY_HH_MM_SS format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;
    
    const canvas = await html2canvas(el, { scale: 2 });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // Filename format: Float_Walk_{InvoiceNumber}_DD_MM_YYYY_HH_MM_SS.pdf
    pdf.save(`Float_Walk_${inv.invoiceNumber}_${timestamp}.pdf`);
  };

  const handleWhatsApp = async () => {
    if (!inv.customerMobile) {
      toast.error('Customer mobile number not found');
      return;
    }

    try {
      toast.info('Downloading PDF and opening WhatsApp...');
      
      // Generate PDF first
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const el = document.getElementById('invoice-print');
      if (!el) {
        toast.error('Invoice content not found');
        return;
      }
      
      // Generate timestamp
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;
      
      const canvas = await html2canvas(el, { scale: 2 });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      
      // Download the PDF
      const filename = `Float_Walk_${inv.invoiceNumber}_${timestamp}.pdf`;
      pdf.save(filename);
      
      // Clean phone number (remove non-digits and add country code if needed)
      let phoneNumber = inv.customerMobile.replace(/\D/g, '');
      
      // If number doesn't start with country code, add India code (91)
      if (phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
      }
      
      // Create WhatsApp message (without emojis for better compatibility)
      const msg = encodeURIComponent(
        `Hello ${inv.customerName},\n\n` +
        `Here is your invoice from *${settings.storeName}*\n\n` +
        `*Invoice Details:*\n` +
        `Invoice Number: *${inv.invoiceNumber}*\n` +
        `Date: ${formattedDate}\n` +
        `Total Amount: Rs.${inv.grandTotal.toLocaleString('en-IN')}\n` +
        `Paid: Rs.${inv.advancePaid.toLocaleString('en-IN')}\n` +
        `Balance Due: Rs.${inv.balanceDue.toLocaleString('en-IN')}\n\n` +
        `_The invoice PDF has been downloaded to your device. Please attach it to this chat and send._\n\n` +
        `Thank you for your business!`
      );
      
      // Open WhatsApp (works on both mobile app and web)
      window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank');
      
      toast.success('PDF downloaded! Opening WhatsApp...');
    } catch (error) {
      console.error('WhatsApp share error:', error);
      toast.error('Failed to process request');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 no-print">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}><ArrowLeft className="w-4 h-4" /></Button>
        <h1 className="font-display text-xl font-bold flex-1">{inv.invoiceNumber}</h1>
        <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2"><Edit className="w-4 h-4" />Edit</Button>
        <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)} className="gap-2 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" />Delete</Button>
        <div className="h-6 w-px bg-border" />
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2"><Printer className="w-4 h-4" />{t('print', settings.language)}</Button>
        <Button variant="outline" size="sm" onClick={handlePdf} className="gap-2"><Download className="w-4 h-4" />{t('download_pdf', settings.language)}</Button>
        <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-2"><MessageCircle className="w-4 h-4" />{t('share_whatsapp', settings.language)}</Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-lg max-w-[210mm] mx-auto">
         <InvoicePrintContent invoice={inv} />
      </div>

      <ConfirmDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
