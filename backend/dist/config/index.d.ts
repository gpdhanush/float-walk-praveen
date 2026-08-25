export declare const config: {
    readonly env: string;
    readonly port: number;
    readonly mysql: {
        readonly host: string;
        readonly port: number;
        readonly user: string;
        readonly password: string;
        readonly database: string;
    };
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiry: string;
        readonly refreshExpiry: string;
    };
    readonly cors: {
        readonly origins: string[];
    };
    readonly app: {
        readonly name: string;
    };
    readonly googleBusiness: {
        readonly clientId: string;
        readonly clientSecret: string;
        readonly redirectUri: string;
        readonly refreshToken: string;
        readonly locationId: string;
    };
    readonly log: {
        readonly level: string;
    };
    readonly pagination: {
        readonly defaultLimit: 10;
        readonly maxLimit: 100;
    };
    readonly analytics: {
        readonly enabled: boolean;
        readonly deduplicationMinutes: number;
        readonly trackAdmin: boolean;
        readonly publicCountEnabled: boolean;
        readonly rateLimitPerMinute: number;
        readonly cacheTtlSeconds: number;
    };
};
//# sourceMappingURL=index.d.ts.map