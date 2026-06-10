import { ZodError } from 'zod';
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed.',
                    errors: error.errors.map((e) => ({
                        field: e.path.slice(1).join('.'),
                        message: e.message,
                    })),
                });
            }
            next(error);
        }
    };
};
