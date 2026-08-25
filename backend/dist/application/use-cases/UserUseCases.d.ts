import type { User, UserRole, UserStatus } from "../../domain/entities/User.js";
import type { IUserRepository, FindUsersFilter } from "../../domain/repositories/IUserRepository.js";
import { AuthService } from "../services/AuthService.js";
export declare class UserUseCases {
    private readonly userRepo;
    private readonly authService;
    constructor(userRepo: IUserRepository, authService: AuthService);
    create(data: {
        email: string;
        password: string;
        name: string;
        role?: UserRole;
        status?: UserStatus;
    }): Promise<Omit<User, "passwordHash">>;
    getById(id: string): Promise<Omit<User, "passwordHash"> | null>;
    list(filter: FindUsersFilter): Promise<{
        users: Omit<User, "passwordHash">[];
        total: number;
    }>;
    update(id: string, data: {
        name?: string;
        role?: UserRole;
        status?: UserStatus;
        password?: string;
        storeName?: string;
        storeAddress?: string;
        phone?: string;
        officePhone?: string;
        gstPercent?: number;
        gstNumber?: string;
        logoUrl?: string;
        theme?: "light" | "dark";
        themeColor?: string;
        language?: "en" | "ta";
    }): Promise<Omit<User, "passwordHash"> | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=UserUseCases.d.ts.map