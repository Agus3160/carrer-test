"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { SigninBody, SigninSchema } from "../schemas/signin.schema";
import { signin } from "../actions/singin.action";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { toast } from "@/shared/components/ui/toast";

export const SigninView = () => {
  const form = useForm({
    resolver: zodResolver(SigninSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (body: SigninBody) => {
    const res = await signin(body);
    if (!res.success)
      toast.add({
        type: "error",
        description: res.message || "Error de inicio de sesión",
      });
  };

  return (
    <div className="flex items-center justify-center h-dvh">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa tu correo y contraseña para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="flex flex-col gap-6">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Correo*</FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="m@example.com"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Contraseña*</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      {...field}
                      placeholder="Ingresa tu contraseña"
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button form="signin-form" type="submit" className="w-full">
            Acceder
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
