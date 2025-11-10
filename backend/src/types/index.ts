import { Request } from "express";

export interface IUser {
  _id?: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDengueCase {
  provinceCode: string;
  provinceName: string;
  regencyCode: string;
  regencyName: string;
  year: number;
  totalCases: number;
  maleDeaths: number;
  femaleDeaths: number;
  totalDeaths: number;
  caseFatalityRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  validatedData?: any;
  user?: IUser;
  userId?: string;
}

export interface ResponseData {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export type LoginData = {
  email?: string;
  username?: string;
  password: string;
};

export type SignupData = {
  fullName: string;
  email: string;
  username: string;
  password: string;
};

export type VerifyAccountData = {
  email?: string;
  username?: string;
};

export type ResetPasswordData = {
  email?: string;
  username?: string;
  password: string;
};
