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
  const balanceDueFromApi = Number(inv.balanceDue ?? NaN);
  const balanceDue =
    Number.isFinite(balanceDueFromApi) ? balanceDueFromApi : amountDue;
  const displayStatus = inv.status || (
    advancePaid > 0 && balanceDue > 0
      ? "partial"
      : balanceDue <= 0 && grandTotal > 0
        ? "paid"
        : "pending"
  );
  const isPaid = displayStatus === "paid";
  // If marked as paid, treat the remaining as "final payment" to make due = 0.
  const finalPayment = isPaid ? Math.max(0, grandTotal - advancePaid) : 0;
  const dueDisplay = isPaid ? 0 : balanceDue;

  const isGstBill = (inv.gstAmount || 0) > 0 || (inv.gstPercent || 0) > 0;

  // Get full logo URL
  const fullLogoUrl = getLogoUrl(settings.logoUrl);

  const statusBadgeClass =
    displayStatus === "paid"
      ? "bg-green-100 text-green-700"
      : displayStatus === "pending"
        ? "bg-red-100 text-red-700"
        : displayStatus === "partial"
          ? "bg-yellow-100 text-yellow-700"
          : displayStatus === "hold"
            ? "bg-gray-100 text-gray-600"
            : "bg-gray-100 text-gray-600";

  return (
    <>
      <style>{`
        @media print { 
          @page { margin: 20mm; size: A4; } 
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; } 
          .app-shell { display: none !important; }
          #invoice-print { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: none !important; min-height: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div
        id="invoice-print"
        className="bg-white p-10 w-full mx-auto rounded-[5px] border border-slate-200 print:min-h-0"
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
              <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-[5px] mb-3">
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
                  className={`text-[14px] px-3 py-1 rounded-full inline-block font-bold uppercase mt-2 ${statusBadgeClass}`}
                >
                  {displayStatus}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To / Advance For */}
        <div className="mb-6 border border-primary/15 bg-primary/[0.04] p-4 rounded-[5px]">
          <p className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wider">
            {inv.type === "Advance Payment" ? "ADVANCE PAYMENT FOR" : "BILL TO"}
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
        <table className="w-full text-xs mb-6 border-collapse border border-slate-300 rounded-[5px] overflow-hidden">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="text-left p-2 border border-gray-400">
                DESCRIPTION
              </th>
              <th className="text-right p-2 border border-gray-400 w-24">
                SCAN
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
                <td className="p-2 border border-gray-400 text-right">
                  ₹
                  {(Number((item as any).scan ?? (item as any).scanPrice ?? 0) || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
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
        <div className="ml-auto w-80 border border-slate-300 rounded-[5px] overflow-hidden">
          <div className="divide-y divide-gray-400 text-xs">
            <div className="flex justify-between items-center py-1.5 px-2">
              <span className="font-semibold">Invoice Total</span>
              <span className="font-medium">
                ₹
                {(Number(grandTotal) || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-2 text-green-700">
              <span className="font-semibold">Advance Received</span>
              <span className="font-medium">
                -₹
                {(Number(advancePaid) || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {isPaid && finalPayment > 0 && (
              <div className="flex justify-between items-center py-1.5 px-2 text-green-700">
                <span className="font-semibold">Final Payment</span>
                <span className="font-medium">
                  -₹
                  {(Number(finalPayment) || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <div
              className={`flex justify-between items-center py-2 px-2 font-bold ${
                isPaid ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              <span>{isPaid ? "Balance Due" : "Amount Due"}</span>
              <span>
                ₹
                {(Number(dueDisplay) || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in Words - 1px border */}
        <div className="mt-4 py-2 px-3 border border-slate-300 bg-slate-50 rounded-[5px]">
          <p className="text-xs">
            <span className="font-semibold">Amount in Words: </span>
            <span className="font-bold">{numberToWords(isPaid ? grandTotal : dueDisplay)}</span>
          </p>
        </div>

        {/* Notes (only when present) */}
        {String(inv.notes ?? "").trim().length > 0 && (
          <div className="mt-3 py-2 px-3 border border-slate-300 bg-white rounded-[5px]">
            <p className="text-xs font-semibold mb-1">Notes</p>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
              {String(inv.notes).trim()}
            </p>
          </div>
        )}

        {/* Footer - Signatures and print notice */}
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

          <div className="text-center mt-8 pt-4 border-t border-gray-300">
            <p className="text-[10px] text-muted-foreground mt-1">
              {t("computer_generated", settings.language)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
