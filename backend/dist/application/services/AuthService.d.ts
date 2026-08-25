import type { User } from '../../domain/entities/User.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
}
export interface LoginResult {
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class AuthService {
    private readonly userRepo;
    constructor(userRepo: IUserRepository);
    hashPassword(password: string): Promise<string>;
    validatePassword(password: string): void;
    verifyPassword(plain: string, hash: string): Promise<boolean>;
    login(email: string, password: string): Promise<LoginResult>;
    generateAccessToken(user: User): string;
    generateRefreshToken(user: User): string;
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): TokenPayload;
    refreshTokens(refreshToken: string): Promise<LoginResult>;
}
//# sourceMappingURL=AuthService.d.ts.map