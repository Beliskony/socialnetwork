export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.errors });
        }
        req.body = result.data;
        next();
    };
};
