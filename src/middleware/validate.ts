import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/** Which part of the request to validate */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory that validates request data against a Zod schema.
 * Parses and replaces the target with the validated (and coerced) data.
 *
 * Usage:
 *   router.post('/properties', validate(createPropertySchema, 'body'), handler)
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, params)
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);

      // Replace with parsed/coerced values
      switch (target) {
        case 'body':
          req.body = parsed;
          break;
        case 'query':
          // Express query is typed as ParsedQs, so we cast through unknown
          (req as unknown as Record<string, unknown>).query = parsed;
          break;
        case 'params':
          (req as unknown as Record<string, unknown>).params = parsed;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || '_root';
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        }
        next(new ValidationError('Validation failed', fieldErrors));
        return;
      }
      next(error);
    }
  };
}
