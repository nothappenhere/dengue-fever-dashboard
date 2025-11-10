import { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse.js";

const notFound = (req: Request, res: Response): void => {
  const statusCode = 404;
  const message = `Not found endpoint: ${req.originalUrl}`;
  sendResponse(res, statusCode, false, message, null, {
    detail: message,
  });
};

export default notFound;
