import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";
import { sendResponse } from "../utils/sendResponse.js";
import { AuthRequest } from "../types/index.js";

export const validateSchema =
  (schema: ZodObject) =>
  (req: Request & AuthRequest, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      sendResponse(res, 400, false, "Validation failed", null, {
        detail: result.error.message,
      });
      return;
    }

    req.validatedData = result.data;
    next();
  };
