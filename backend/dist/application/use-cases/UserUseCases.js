import { AppError, ErrorCodes } from "../../utils/errors.js";
export class UserUseCases {
    userRepo;
    authService;
    constructor(userRepo, authService) {
        this.userRepo = userRepo;
        this.authService = authService;
    }
    async create(data) {
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing) {
            throw new AppError(ErrorCodes.CONFLICT, "Email already registered", 409);
        }
        const passwordHash = await this.authService.hashPassword(data.password);
        const user = await this.userRepo.create({
            id: crypto.randomUUID(),
            email: data.email,
            passwordHash,
            name: data.name,
            role: data.role ?? "EMPLOYEE",
            status: data.status ?? "ACTIVE",
            storeName: "FootWear Pro",
            gstPercent: 18,
            theme: "light",
            themeColor: "blue",
            language: "en",
        });
        const { passwordHash: _, ...out } = user;
        return out;
    }
    async getById(id) {
        const user = await this.userRepo.findById(id);
        if (!user)
            return null;
        const { passwordHash: _, ...out } = user;
        return out;
    }
    async list(filter) {
        const { users, total } = await this.userRepo.findMany(filter);
        return {
            users: users.map((u) => {
                const { passwordHash: _, ...rest } = u;
                return rest;
            }),
            total,
        };
    }
    async update(id, data) {
        const user = await this.userRepo.findById(id);
        if (!user)
            return null;
        const updates = {};
        if (data.name !== undefined)
            updates.name = data.name;
        if (data.role !== undefined)
            updates.role = data.role;
        if (data.status !== undefined)
            updates.status = data.status;
        if (data.storeName !== undefined)
            updates.storeName = data.storeName;
        if (data.storeAddress !== undefined)
            updates.storeAddress = data.storeAddress;
        if (data.phone !== undefined)
            updates.phone = data.phone;
        if (data.officePhone !== undefined)
            updates.officePhone = data.officePhone;
        if (data.gstPercent !== undefined)
            updates.gstPercent = data.gstPercent;
        if (data.gstNumber !== undefined)
            updates.gstNumber = data.gstNumber;
        if (data.logoUrl !== undefined)
            updates.logoUrl = data.logoUrl;
        if (data.theme !== undefined)
            updates.theme = data.theme;
        if (data.themeColor !== undefined)
            updates.themeColor = data.themeColor;
        if (data.language !== undefined)
            updates.language = data.language;
        if (data.password !== undefined) {
            updates.passwordHash = await this.authService.hashPassword(data.password);
        }
        const updated = await this.userRepo.update(id, updates);
        if (!updated)
            return null;
        const { passwordHash: _, ...out } = updated;
        return out;
    }
    async delete(id) {
        return this.userRepo.softDelete(id);
    }
}
//# sourceMappingURL=UserUseCases.js.map