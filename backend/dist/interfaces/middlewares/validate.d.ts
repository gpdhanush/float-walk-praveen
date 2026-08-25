import type { Request, Response, NextFunction } from 'express';
import type Joi from 'joi';
type Source = 'body' | 'query' | 'params' | 'headers';
export declare function validate(schema: Joi.Schema, source?: Source): (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.d.ts.map