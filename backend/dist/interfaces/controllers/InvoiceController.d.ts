import type { Request, Response, NextFunction } from "express";
export declare function createInvoice(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateInvoice(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getInvoice(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listInvoices(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addItem(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function removeItem(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function addPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function sendEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function sendWhatsApp(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteInvoice(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=InvoiceController.d.ts.map