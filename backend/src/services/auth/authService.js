import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../../config/db.js";
import { jwtConfig } from "../../config/jwt.js";

export async function registerUser({ email, username, password }) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, username, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, username, role, created_at`,
    [email, username, hash]
  );
  return rows[0];
}

export async function loginUser({ email, password }) {
  const { rows } = await pool.query(
    `SELECT id, email, username, password_hash, role FROM users WHERE email = $1`,
    [email]
  );
  const user = rows[0];
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  delete user.password_hash;
  return user;
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, email, username, avatar_url, role, created_at FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
}
