import type { User, UserRole, UserStatus } from '../../domain/entities/User.js';
import type { IUserRepository, FindUsersFilter } from '../../domain/repositories/IUserRepository.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { AuthService } from '../services/AuthService.js';

export class UserUseCases {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authService: AuthService
  ) {}

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError(ErrorCodes.CONFLICT, 'Email already registered', 409);
    }
    const passwordHash = await this.authService.hashPassword(data.password);
    const user = await this.userRepo.create({
      id: crypto.randomUUID(),
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role ?? 'EMPLOYEE',
      status: data.status ?? 'ACTIVE',
      storeName: 'FootWear Pro',
      gstPercent: 18,
      theme: 'light',
      themeColor: 'blue',
      language: 'en',
    });
    const { passwordHash: _, ...out } = user;
    return out;
  }

  async getById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepo.findById(id);
    if (!user) return null;
    const { passwordHash: _, ...out } = user;
    return out;
  }

  async list(filter: FindUsersFilter): Promise<{ users: Omit<User, 'passwordHash'>[]; total: number }> {
    const { users, total } = await this.userRepo.findMany(filter);
    return {
      users: users.map((u) => {
        const { passwordHash: _, ...rest } = u;
        return rest;
      }),
      total,
    };
  }

  async update(
    id: string,
    data: { 
      name?: string; 
      role?: UserRole; 
      status?: UserStatus; 
      password?: string;
      storeName?: string;
      storeAddress?: string;
      phone?: string;
      gstPercent?: number;
      gstNumber?: string;
      logoUrl?: string;
      theme?: 'light' | 'dark';
      themeColor?: string;
      language?: 'en' | 'ta';
    }
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepo.findById(id);
    if (!user) return null;
    const updates: Partial<User> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.role !== undefined) updates.role = data.role;
    if (data.status !== undefined) updates.status = data.status;
    if (data.storeName !== undefined) updates.storeName = data.storeName;
    if (data.storeAddress !== undefined) updates.storeAddress = data.storeAddress;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.gstPercent !== undefined) updates.gstPercent = data.gstPercent;
    if (data.gstNumber !== undefined) updates.gstNumber = data.gstNumber;
    if (data.logoUrl !== undefined) updates.logoUrl = data.logoUrl;
    if (data.theme !== undefined) updates.theme = data.theme;
    if (data.themeColor !== undefined) updates.themeColor = data.themeColor;
    if (data.language !== undefined) updates.language = data.language;
    if (data.password !== undefined) {
      updates.passwordHash = await this.authService.hashPassword(data.password);
    }
    const updated = await this.userRepo.update(id, updates);
    if (!updated) return null;
    const { passwordHash: _, ...out } = updated;
    return out;
  }

  async delete(id: string): Promise<boolean> {
    return this.userRepo.softDelete(id);
  }
}
