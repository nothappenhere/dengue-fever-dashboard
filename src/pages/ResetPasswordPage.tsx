import React from "react";
import { useLocation, useNavigate, Link } from "react-router";
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
  ResetPasswordSchema,
  type TResetPassword,
  defaultResetPasswordFormValues,
} from "@/schemas/authSchema";
import { cn } from "@/lib/utils";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userData = location.state as { username?: string };

  const form = useForm<TResetPassword>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      ...defaultResetPasswordFormValues,
      ...userData,
    },
  });

  const onSubmit = async (data: TResetPassword) => {
    setIsLoading(true);

    try {
      const response = await api.put("/auth/reset-password", data);
      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
        form.reset();
      }
    } catch (err: any) {
      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || "Password reset failed";
      toast.error(`${message}!`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-muted min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Password Reset Successfully
            </CardTitle>
            <CardDescription>
              You can now login with your new password.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <Button
              asChild
              onClick={() => navigate("/auth/login")}
              className="w-full cursor-pointer"
            >
              <Link to="/reset-password">Log in</Link>
            </Button>
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
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your new password to reset password
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn("flex flex-col gap-4")}
              >
                <FieldGroup>
                  {userData?.username && (
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
                            className="bg-muted"
                            placeholder="Enter your username"
                            value={userData.username}
                            disabled
                            autoComplete="off"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  )}

                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter your new password"
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
                      {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
