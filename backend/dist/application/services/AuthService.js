import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
const SALT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
export class AuthService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async hashPassword(password) {
        this.validatePassword(password);
        return bcrypt.hash(password, SALT_ROUNDS);
    }
    validatePassword(password) {
        if (password.length < PASSWORD_MIN_LENGTH) {
            throw new AppError(ErrorCodes.VALIDATION_ERROR, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`, 400);
        }
        if (!PASSWORD_REGEX.test(password)) {
            throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Password must contain uppercase, lowercase, number and special character', 400);
        }
    }
    async verifyPassword(plain, hash) {
        return bcrypt.compare(plain, hash);
    }
    async login(email, password) {
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
    generateAccessToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            type: 'access',
        };
        return jwt.sign(payload, config.jwt.accessSecret, {
            expiresIn: config.jwt.accessExpiry,
        });
    }
    generateRefreshToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            type: 'refresh',
        };
        return jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiry,
        });
    }
    verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.accessSecret);
            if (decoded.type !== 'access')
                throw new Error('Invalid token type');
            return decoded;
        }
        catch {
            throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired token', 401);
        }
    }
    verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.refreshSecret);
            if (decoded.type !== 'refresh')
                throw new Error('Invalid token type');
            return decoded;
        }
        catch {
            throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired refresh token', 401);
        }
    }
    async refreshTokens(refreshToken) {
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
//# sourceMappingURL=AuthService.js.map