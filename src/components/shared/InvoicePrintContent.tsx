import { useDataStore, Invoice } from "@/stores/dataStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { t } from "@/lib/i18n";
import { format } from "date-fns";
import { getLogoUrl } from "@/lib/utils/logoUtils";
import { numberToWords } from "@/lib/utils/numberToWords";
import { useState } from "react";

export function InvoicePrintContent({ invoice }: { invoice: Invoice }) {
  const settings = useSettingsStore();
  const inv = invoice;
  const [logoError, setLogoError] = useState(false);

  const formattedDate = (() => {
    try {
      return format(
        new Date(inv.date || (inv as any).createdAt),
        "dd-MMM-yyyy",
      );
    } catch {
      return inv.date;
    }
  })();

  // Totals: match form logic (round to nearest rupee)
  const subtotal =
    Number(inv.subtotal ?? 0) ||
    (inv.items || []).reduce((s, i) => s + (i.total || 0), 0);
  const gstAmount =
    Number(inv.gstAmount ?? 0) || subtotal * ((inv.gstPercent || 0) / 100);
  const rawGrandTotal = subtotal + gstAmount;
  const roundOff = Math.round(rawGrandTotal) - rawGrandTotal;
  const grandTotal = rawGrandTotal + roundOff;
  const advancePaid = Number(inv.advancePaid ?? inv.paidAmount ?? 0);
  const amountDue = grandTotal - advancePaid;

  const isGstBill = (inv.gstAmount || 0) > 0 || (inv.gstPercent || 0) > 0;

  // Get full logo URL
  const fullLogoUrl = getLogoUrl(settings.logoUrl);

  return (
    <>
      <style>{`
        @media print { 
          @page { margin: 20mm; size: A4; } 
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
          #invoice-print { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: none !important; min-height: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div
        id="invoice-print"
        className="bg-white p-10 w-full mx-auto"
        style={{ maxWidth: "210mm", minHeight: "297mm" }}
      >
        {/* Modern Header */}
        <div className="border-b-2 border-primary pb-6 mb-8">
          <div className="flex justify-between items-start">
            {/* Left: Logo & Store Info */}
            <div className="flex gap-4 items-start">
              {/* Logo */}
              {fullLogoUrl && !logoError ? (
                <div className="w-20 h-20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={fullLogoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <span className="text-3xl font-bold text-primary">
                    {settings.storeName?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                </div>
              )}

              {/* Store Details */}
              <div className="space-y-0.5">
                <h1 className="font-display text-2xl font-black text-primary tracking-tight leading-tight">
                  {settings.storeName}
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
                  {settings.address}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {settings.mobile}
                  {settings.officePhone && ` | ${settings.officePhone}`}
                  {settings.phone &&
                    settings.phone !== settings.mobile &&
                    settings.phone !== settings.officePhone &&
                    ` | ${settings.phone}`}
                </p>
                {settings.email && (
                  <p className="text-xs text-muted-foreground">
                    {settings.email}
                  </p>
                )}
                {/* Only show GST if this is a GST bill */}
                {isGstBill && settings.gstNumber && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded uppercase">
                      GSTIN
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {settings.gstNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Invoice/Quotation Badge & Details */}
            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg mb-3">
                <h2 className="text-sm font-bold tracking-widest uppercase">
                  {inv.type || "INVOICE"}
                </h2>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black tracking-tight text-primary leading-none">
                  {inv.invoiceNumber}
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {formattedDate}
                </p>
                <div
                  className={`text-[10px] px-3 py-1 rounded-full inline-block font-bold uppercase mt-2 ${
                    inv.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : inv.status === "partial"
                        ? "bg-yellow-100 text-yellow-700"
                        : inv.status === "hold"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {inv.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To / Quotation For / Advance For */}
        <div className="mb-6 bg-muted/30 p-4 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wider">
            {inv.type === "Quotation"
              ? "QUOTATION FOR"
              : inv.type === "Advance Payment"
                ? "ADVANCE PAYMENT FOR"
                : "BILL TO"}
          </p>
          <p className="font-semibold text-sm">{inv.customerName}</p>
          <p className="text-xs text-muted-foreground">{inv.customerMobile}</p>
          {inv.customerEmail && (
            <p className="text-xs text-muted-foreground">{inv.customerEmail}</p>
          )}
          {inv.customerAddress && (
            <p className="text-xs text-muted-foreground">
              {inv.customerAddress}
            </p>
          )}
        </div>

        {/* Items Table - 1px border, no radius */}
        <table className="w-full text-xs mb-6 border-collapse border border-gray-400">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="text-left p-2 border border-gray-400">
                DESCRIPTION
              </th>
              <th className="text-center p-2 border border-gray-400 w-16">
                QTY
              </th>
              <th className="text-right p-2 border border-gray-400 w-24">
                RATE
              </th>
              <th className="text-right p-2 border border-gray-400 w-28">
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody>
            {(inv.items || []).map((item, i) => (
              <tr key={i}>
                <td className="p-2 border border-gray-400">
                  {item.productName}
                </td>
                <td className="p-2 border border-gray-400 text-center font-medium">
                  {item.quantity}
                </td>
                <td className="p-2 border border-gray-400 text-right">
                  ₹
                  {(Number(item.price) || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="p-2 border border-gray-400 text-right font-medium">
                  ₹
                  {(Number(item.total) || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals - 1px border, 2 decimal places */}
        <div className="ml-auto w-80 border border-gray-400">
          <div className="divide-y divide-gray-400 text-xs">
            <div className="flex justify-between items-center py-1.5 px-2">
              <span className="font-semibold">Subtotal</span>
              <span className="font-medium">
                ₹
                {(Number(subtotal) || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {isGstBill && (
              <div className="flex justify-between items-center py-1.5 px-2">
                <span className="font-semibold">
                  GST ({inv.gstPercent || 0}%)
                </span>
                <span className="font-medium">
                  ₹
                  {(Number(gstAmount) || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {roundOff !== 0 && (
              <div className="flex justify-between items-center py-1.5 px-2">
                <span className="font-semibold">Round Off</span>
                <span className="font-medium">
                  {roundOff > 0 ? "+" : ""}
                  {(Number(roundOff) || 0).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-1.5 px-2 font-medium border-t border-gray-400">
              <span>Grand Total</span>
              <span>
                ₹
                {(Number(grandTotal) || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2 text-red-600">
              <span className="font-semibold">Advance Paid</span>
              <span className="font-medium">
                -₹
                {(Number(advancePaid) || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-2 bg-primary text-primary-foreground font-bold">
              <span>Amount Due</span>
              <span>
                ₹
                {(Number(amountDue) || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in Words - 1px border */}
        <div className="mt-4 py-2 px-3 border border-gray-400 bg-gray-50">
          <p className="text-xs">
            <span className="font-semibold">Amount in Words: </span>
            <span className="font-bold">{numberToWords(amountDue)}</span>
          </p>
        </div>

        {/* Footer - Signatures (underline style) + Thank You */}
        <div className="mt-12">
          <div className="grid grid-cols-2 gap-4 items-end">
            {/* Customer Signature - underline only */}
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-gray-600 mb-1">&nbsp;</div>
              <p className="text-xs font-semibold">Customer Signature</p>
            </div>
            {/* Authorized Signature - underline only */}
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-gray-600 mb-1">&nbsp;</div>
              <p className="text-xs font-semibold">Authorized Signature</p>
            </div>
          </div>

          {/* Thank You Note */}
          <div className="text-center mt-8 pt-4 border-t border-gray-300">
            <p className="text-xs font-semibold text-primary">
              {t("thank_you", settings.language)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {t("computer_generated", settings.language)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
