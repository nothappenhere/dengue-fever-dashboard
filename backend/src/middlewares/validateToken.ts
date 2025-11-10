import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse.js";
import { AuthRequest } from "../types/index.js";

interface JwtPayload {
  userId: string;
}

export const validateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Gunakan optional chaining untuk cookies
  const token = req.cookies?.token;

  if (!token) {
    sendResponse(res, 401, false, "Unauthorized - No token provided");
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    if (!decoded) {
      sendResponse(res, 401, false, "Unauthorized - Invalid or expired token");
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    sendResponse(res, 500, false, "Internal server error", null, {
      detail: errorMessage,
    });
  }
};
