import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

/** Sets req.user when a valid token is present; continues anonymously otherwise. */
export function optionalAuthMiddleware(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;

  if (!token) {
    next();
    return;
  }

  try {
    req.user = jwt.verify(token, jwtConfig.secret);
  } catch {
    /* ignore invalid token for public reads */
  }
  next();
}
