import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  status?: number;
}

export default function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err.stack);
  res.status(err.status ?? 500).json({
    message: err.message ?? "Internal Server Error",
  });
}
