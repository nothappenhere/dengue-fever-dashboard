import express from "express";
import {
  login,
  register,
  verifyAccount,
  resetPassword,
  checkAuth,
  logout,
} from "../controllers/authController.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { validateToken } from "../middlewares/validateToken.js";
import {
  LoginSchema,
  signupSchema,
  VerifyAccountSchema,
  ResetPasswordSchema,
} from "../schemas/authSchema.js";

const router = express.Router();

/**
 * @desc Login user
 * @route POST /api/auth/login
 */
router.post("/login", validateSchema(LoginSchema), login);

/**
 * @desc Registrasi user
 * @route POST /api/auth/register
 */
router.post("/register", validateSchema(signupSchema), register);

/**
 * @desc Verifikasi akun dengan email/username
 * @route POST /api/auth/verify-account
 */
router.post(
  "/verify-account",
  validateSchema(VerifyAccountSchema),
  verifyAccount
);

/**
 * @desc Reset password user
 * @route PUT /api/auth/reset-password
 */
router.put(
  "/reset-password",
  validateSchema(ResetPasswordSchema),
  resetPassword
);

/**
 * @desc Cek apakah token autentikasi valid dan dapat digunakan (status login)
 * @route GET /api/auth/check-auth
 */
router.get("/check-auth", validateToken, checkAuth);

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 */
router.post("/logout", logout);

export default router;
