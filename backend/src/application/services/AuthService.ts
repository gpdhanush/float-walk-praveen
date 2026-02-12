import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { User } from '../../domain/entities/User.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { config } from '../../config/index.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';

const SALT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

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

export class AuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  async hashPassword(password: string): Promise<string> {
    this.validatePassword(password);
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  validatePassword(password: string): void {
    if (password.length < PASSWORD_MIN_LENGTH) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
        400
      );
    }
    if (!PASSWORD_REGEX.test(password)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'Password must contain uppercase, lowercase, number and special character',
        400
      );
    }
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid email or password', 401);
    }
    if (user.status !== 'ACTIVE') {
      throw new AppError(ErrorCodes.FORBIDDEN, 'Account is inactive', 403);
    }
    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid email or password', 401);
    }
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const expiresIn = 900; // 15 min in seconds
    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    } as jwt.SignOptions);
  }

  generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
      if (decoded.type !== 'access') throw new Error('Invalid token type');
      return decoded;
    } catch {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired token', 401);
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
      if (decoded.type !== 'refresh') throw new Error('Invalid token type');
      return decoded;
    } catch {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired refresh token', 401);
    }
  }

  async refreshTokens(refreshToken: string): Promise<LoginResult> {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findById(payload.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'User not found or inactive', 401);
    }
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    const expiresIn = 900;
    const { passwordHash: _, ...safeUser } = user;
    return {
      user: safeUser,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    };
  }
}
