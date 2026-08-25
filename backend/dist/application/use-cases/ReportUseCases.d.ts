export interface DateRange {
    fromDate?: Date | string;
    toDate?: Date | string;
}
export interface SalesReport {
    totalSales: number;
    totalInvoices: number;
    byStatus: {
        status: string;
        count: number;
        total: number;
    }[];
}
export interface ExpensesReport {
    total: number;
    count: number;
    byCategory: {
        category: string;
        total: number;
        count: number;
    }[];
}
export interface PurchasesReport {
    total: number;
    count: number;
}
export declare class ReportUseCases {
    salesReport(range: DateRange): Promise<SalesReport>;
    expensesReport(range: DateRange): Promise<ExpensesReport>;
    purchasesReport(range: DateRange): Promise<PurchasesReport>;
}
//# sourceMappingURL=ReportUseCases.d.ts.map