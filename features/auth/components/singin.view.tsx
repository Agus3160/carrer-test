"use client";

import { CompassIcon, LockKeyholeIcon } from "lucide-react";
import Link from "next/link";
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
        description: res.message || "No se pudo iniciar la sesión",
      });
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
      <div aria-hidden="true" className="landing-glow pointer-events-none absolute left-1/2 top-0 h-96 w-[min(90vw,60rem)] -translate-x-1/2 rounded-full" />
      <section className="animate-enter relative w-full max-w-md">
        <Link href="/" className="mb-7 flex items-center justify-center gap-2.5 text-sm font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
            <CompassIcon className="size-4" aria-hidden="true" />
          </span>
          Brújula
        </Link>
        <Card className="w-full border-border/80 bg-card/90 shadow-[0_28px_100px_oklch(0_0_0/0.35)]">
          <CardHeader className="gap-3 px-6 pt-7 sm:px-8 sm:pt-8">
            <div className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
              <LockKeyholeIcon className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-medium tracking-tight">Acceso administrativo</CardTitle>
              <CardDescription className="leading-6">
                Ingresa tus credenciales para administrar la orientación vocacional.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 sm:px-8">
            <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="flex flex-col gap-5">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Correo electrónico</FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="nombre@correo.com"
                        autoComplete="username"
                        {...field}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                      <Input
                        id={field.name}
                        type="password"
                        autoComplete="current-password"
                        placeholder="Ingresa tu contraseña"
                        {...field}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2 border-t-0 bg-transparent px-6 pb-7 sm:px-8 sm:pb-8">
            <Button form="signin-form" type="submit" className="h-11 w-full">
              Ingresar
            </Button>
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Este acceso está reservado para el equipo administrador.
            </p>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
};
