import type { BaseEntity } from "./BaseEntity.js";
export type UserRole = "ADMIN" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE";
export type Theme = "light" | "dark";
export type Language = "en" | "ta";
export interface User extends BaseEntity {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    storeName?: string;
    storeAddress?: string;
    phone?: string;
    officePhone?: string;
    gstPercent: number;
    gstNumber?: string;
    logoUrl?: string;
    theme: Theme;
    themeColor: string;
    language: Language;
}
//# sourceMappingURL=User.d.ts.map