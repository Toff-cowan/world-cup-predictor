import {
  registerUser,
  loginUser,
  signToken,
  getUserById,
} from "../../services/auth/authService.js";
import { ok, fail } from "../../utils/apiResponse.js";

export async function register(req, res, next) {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return fail(res, "email, username, and password are required");
    }
    const user = await registerUser({ email, username, password });
    const token = signToken(user);
    return ok(res, { user, token }, 201);
  } catch (err) {
    if (err.code === "23505") return fail(res, "Email or username already exists", 409);
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });
    if (!user) return fail(res, "Invalid credentials", 401);
    const token = signToken(user);
    return ok(res, { user, token });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return fail(res, "User not found", 404);
    return ok(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req, res) {
  return ok(res, { message: "Logged out (remove token on client)" });
}
