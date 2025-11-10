import { Response } from "express";
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (
  res: Response,
  userId: string
): string => {
  const jwtSecret = process.env.JWT_SECRET as string | undefined;
  if (!jwtSecret) {
    throw new Error("JWT secret is not defined in environment");
  }

  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
