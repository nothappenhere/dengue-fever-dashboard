import { Response } from "express";

interface ResponseOptions {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
  errors?: any;
  path?: string;
  timestamp: string;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null,
  errors: any = null
): Response => {
  const response: ResponseOptions = {
    success,
    statusCode,
    message,
    data,
    errors,
    path: res.req?.originalUrl ?? "",
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};
