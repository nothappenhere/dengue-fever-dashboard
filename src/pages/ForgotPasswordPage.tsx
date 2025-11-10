import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/axios";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  VerifyAccountSchema,
  type TVerifyAccount,
  defaultVerifyAccountFormValues,
} from "@/schemas/authSchema";
import { cn } from "@/lib/utils";

const ForgotPassword = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<TVerifyAccount | null>(null);
  const navigate = useNavigate();

  const form = useForm<TVerifyAccount>({
    resolver: zodResolver(VerifyAccountSchema),
    defaultValues: defaultVerifyAccountFormValues,
  });

  const onSubmit = async (data: TVerifyAccount) => {
    setIsLoading(true);

    try {
      const response = await api.post("/auth/verify-account", data);
      if (response.data.success) {
        setIsVerified(true);
        setUserData(data);
        toast.success("Account verified!");
      }
    } catch (err: any) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message || "Account verification failed";
      toast.error(`${message}!`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified && userData) {
    return (
      <div className="bg-muted min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Account Verified
            </CardTitle>
            <CardDescription>
              Please set your new password to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <div className="space-y-3">
              <Button
                onClick={() =>
                  navigate("/auth/reset-password", { state: userData })
                }
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                Reset Password
              </Button>

              <FieldDescription className="px-6 text-center">
                Back to login? <Link to="/auth/login">Log in</Link>
              </FieldDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your username to verify your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn("flex flex-col gap-4")}
              >
                <FieldGroup>
                  <Controller
                    name="username"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input
                          {...field}
                          id="username"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter your username"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Field>
                    <Button
                      type="submit"
                      className="cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify Account"}
                    </Button>
                    <FieldDescription className="px-6 text-center">
                      Back to login? <Link to="/auth/login">Log in</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
