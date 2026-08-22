/**
 * Central Express error handler.
 * Mount as the LAST middleware in server.js.
 *
 * Handles:
 *   - Zod validation errors (passed via next(err) from validate middleware)
 *   - Mongoose CastError (invalid ObjectId)
 *   - Mongoose duplicate key (code 11000)
 *   - Generic errors
 *
 * Never exposes stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  // Zod validation errors (wrapped by our validate middleware)
  if (err.isZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors,
    });
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  // JWT errors (thrown by requireAuth)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && !isDev
      ? "An internal server error occurred"
      : err.message || "An error occurred";

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

export default errorHandler;
