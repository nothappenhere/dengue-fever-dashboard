import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { sendResponse } from "../utils/sendResponse.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  AuthRequest,
  LoginData,
  SignupData,
  VerifyAccountData,
  ResetPasswordData,
  IUserDocument,
} from "../types/index.js";

/**
 * * @desc Login user
 * @route POST /api/auth/login
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, password } = req.validatedData as LoginData;

  try {
    const existUser = await User.findOne({ username });
    if (!existUser) {
      sendResponse(res, 400, false, "Invalid credentials, please try again");
      return;
    }

    // Cast to IUserDocument untuk mengakses property
    const userDoc = existUser as unknown as IUserDocument;

    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      sendResponse(res, 400, false, "Invalid credentials, please try again");
      return;
    }

    generateTokenAndSetCookie(res, userDoc._id.toString());

    // Update lastLogin
    await User.findByIdAndUpdate(userDoc._id, {
      lastLogin: new Date(),
    });

    sendResponse(res, 200, true, "Logged in successfully", {
      user: {
        _id: userDoc._id,
        fullName: userDoc.fullName,
        email: userDoc.email,
        username: userDoc.username,
        lastLogin: userDoc.lastLogin,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * * @desc Registrasi user
 * @route POST /api/auth/register
 */
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { email, fullName, username, password } =
    req.validatedData as SignupData;

  try {
    const existUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existUser) {
      sendResponse(
        res,
        409,
        false,
        "The user with that email/username is already registered"
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      fullName,
      username,
      password: hashedPassword,
    });

    // Cast to IUserDocument untuk mengakses property
    const newUserDoc = newUser as unknown as IUserDocument;

    sendResponse(res, 201, true, "Successfully created new users", {
      user: {
        _id: newUserDoc._id,
        fullName: newUserDoc.fullName,
        email: newUserDoc.email,
        username: newUserDoc.username,
        lastLogin: newUserDoc.lastLogin,
        createdAt: newUserDoc.createdAt,
        updatedAt: newUserDoc.updatedAt,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * * @desc Verifikasi akun dengan email/username
 * @route POST /api/auth/verify-account
 */
export const verifyAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { username } = req.validatedData as VerifyAccountData;

  try {
    const existUser = await User.findOne({ username });

    if (!existUser) {
      sendResponse(res, 404, false, "User not found", {
        exist: false,
      });
      return;
    }

    sendResponse(
      res,
      200,
      true,
      "The user has been registered, please enter new password",
      { exist: true }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * * @desc Reset password user
 * @route PUT /api/auth/reset-password
 */
export const resetPassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { username, password } = req.validatedData as ResetPasswordData;

  try {
    const existUser = await User.findOne({ username });
    if (!existUser) {
      sendResponse(res, 404, false, "User not found", {
        exist: false,
      });
      return;
    }

    const newHashedPassword = await bcrypt.hash(password, 12);

    await User.updateOne(
      { username },
      { $set: { password: newHashedPassword } }
    );

    sendResponse(res, 200, true, "Successfully reset password");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * * @desc Cek apakah token autentikasi valid dan dapat digunakan (status login)
 * @route GET /api/auth/check-auth
 */
export const checkAuth = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      sendResponse(res, 401, false, "Unauthorized");
      return;
    }

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }

    // Cast to IUserDocument untuk mengakses property
    const userDoc = user as unknown as IUserDocument;

    sendResponse(res, 200, true, "Authenticated user", {
      user: {
        _id: userDoc._id,
        fullName: userDoc.fullName,
        email: userDoc.email,
        username: userDoc.username,
        lastLogin: userDoc.lastLogin,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};

/**
 * * @desc Logout user
 * @route POST /api/auth/logout
 */
export const logout = async (_: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token");
    sendResponse(res, 200, true, "Logged out successfully");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};
