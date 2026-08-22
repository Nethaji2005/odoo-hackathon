/**
 * validate(schema) — Zod validation middleware
 *
 * Usage:
 *   router.post("/employees", requireAuth, validate(createEmployeeSchema), createEmployee)
 *
 * On failure, passes a shaped error to the central errorHandler.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const err = new Error("Validation failed");
    err.isZodError = true;
    err.errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return next(err);
  }

  // Replace req.body with the parsed (coerced + stripped) data
  req.body = result.data;
  next();
};

export default validate;
