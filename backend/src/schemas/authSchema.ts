import { z } from "zod";

export const authSchema = z.object({
  fullName: z
    .string()
    .nonempty("Full name cannot be empty!")
    .min(5, "The full name must be at least 5 characters long!")
    .transform((val) => val.trim()),
  email: z
    .string()
    .nonempty("Email address cannot be empty!")
    .max(100, "The email address are limited to 100 characters!")
    .transform((val) => val.toLowerCase().trim()),
  username: z
    .string()
    .nonempty("Username cannot be empty!")
    .min(5, "The username must be at least 5 characters long!")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .nonempty("Password cannot be empty!")
    .min(8, "Passwords must be at least 8 characters long!")
    .regex(/[0-9]/, "Passwords must contain at least 1 number!")
    .regex(/[a-z]/, "Passwords must contain at least 1 lowercase letter!")
    .regex(/[A-Z]/, "Passwords must contain at least 1 uppercase letter!")
    .regex(
      /[^A-Za-z0-9]/,
      "Passwords must contain at least 1 special character!"
    ),
});

export const LoginSchema = authSchema.pick({
  username: true,
  password: true,
});
export type TLogin = z.infer<typeof LoginSchema>;
export const defaultLoginFormValues: TLogin = {
  username: "",
  password: "",
};

export const signupSchema = authSchema;
export type TSignup = z.infer<typeof signupSchema>;
export const defaultSignupFormValues: TSignup = {
  fullName: "",
  email: "",
  username: "",
  password: "",
};

export const VerifyAccountSchema = authSchema.pick({
  username: true,
});
export type TVerifyAccount = z.infer<typeof VerifyAccountSchema>;
export const defaultVerifyAccountFormValues: TVerifyAccount = {
  username: "",
};

export const ResetPasswordSchema = authSchema.pick({
  username: true,
  password: true,
});
export type TResetPassword = z.infer<typeof ResetPasswordSchema>;
export const defaultResetPasswordFormValues: TResetPassword = {
  username: "",
  password: "",
};
