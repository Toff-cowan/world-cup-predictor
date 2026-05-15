import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
import { fail } from "../utils/apiResponse.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;

  if (!token) {
    return fail(res, "Not authenticated", 401);
  }

  try {
    req.user = jwt.verify(token, jwtConfig.secret);
    next();
  } catch {
    return fail(res, "Invalid or expired token", 401);
  }
}
