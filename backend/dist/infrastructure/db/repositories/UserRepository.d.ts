import type { User } from "../../../domain/entities/User.js";
import type { IUserRepository, FindUsersFilter } from "../../../domain/repositories/IUserRepository.js";
export declare class UserRepository implements IUserRepository {
    create(data: Omit<User, "createdAt" | "updatedAt" | "deletedAt">): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findMany(filter: FindUsersFilter): Promise<{
        users: User[];
        total: number;
    }>;
    update(id: string, data: Partial<User>): Promise<User | null>;
    softDelete(id: string): Promise<boolean>;
}
//# sourceMappingURL=UserRepository.d.ts.map