/**
 * AUTH MIDDLEWARE — INTEGRATION CONTRACT
 * =======================================
 * This file is a STUB for the Employee Profile + Payroll module.
 *
 * Member 1 (Auth module) MUST replace the implementation inside
 * requireAuth with their real JWT verification logic.
 *
 * CONTRACT:
 *   After requireAuth runs, downstream middleware and controllers
 *   can rely on:
 *
 *     req.user = {
 *       id:   String,   // MongoDB _id of the authenticated user/employee
 *       role: String,   // "employee" | "admin" | "hr"
 *     }
 *
 * IMPORTANT:
 *   - Never trust role or id coming from the request body/query.
 *   - Always derive identity from the verified JWT, not from the client.
 *   - The JWT must be signed with process.env.JWT_SECRET.
 *   - The token must be sent in the Authorization header:
 *       Authorization: Bearer <token>
 */

import jwt from "jsonwebtoken";

/**
 * requireAuth
 * Verifies the JWT and attaches req.user.
 * Returns 401 if missing/invalid/expired.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Provide a Bearer token.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Enforce expected shape — Member 1 must include id + role in the JWT payload
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Token payload is missing required fields (id, role).",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error); // Handled by central errorHandler
  }
};

/**
 * requireRole(...roles)
 * Must be used AFTER requireAuth.
 * Allows only users whose role is in the provided list.
 *
 * Usage:
 *   router.get("/employees", requireAuth, requireRole("admin", "hr"), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }

    next();
  };
};
