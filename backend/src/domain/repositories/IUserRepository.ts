import type { User } from '../entities/User.js';

export interface FindUsersFilter {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface IUserRepository {
  create(data: Omit<User, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(filter: FindUsersFilter): Promise<{ users: User[]; total: number }>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  softDelete(id: string): Promise<boolean>;
}
