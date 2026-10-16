"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, UserRoundIcon } from "lucide-react";
import { TextField } from "@/shared/components/form-fields";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FieldGroup } from "@/shared/components/ui/field";
import { CandidateSchema, type CandidateBody } from "../schemas/form.schema";
import { useFormContext } from "./form-provider";

export const PhaseCandidate = () => {
  const { candidate, setCandidate, goToPhase } = useFormContext();
  const form = useForm<CandidateBody>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: { name: candidate.name },
  });

  const onSubmit = (values: CandidateBody) => {
    setCandidate({ name: values.name?.trim() ?? "" });
    goToPhase(1);
  };

  return (
    <Card className="w-full border-0 bg-card/85 shadow-[0_24px_80px_oklch(0_0_0/0.24)] ring-1 ring-border/80">
      <CardHeader className="gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserRoundIcon className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Empecemos por tus intereses</CardTitle>
        <CardDescription>
          No hace falta registrarte. Puedes agregar tu nombre para personalizar el resultado o continuar de forma anónima.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="candidate-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-5">
            <TextField
              control={form.control}
              name="name"
              label="¿Cómo te llamamos? (opcional)"
              placeholder="Tu nombre"
            />
            <p className="text-sm leading-6 text-muted-foreground">
              Tus respuestas describen intereses y preferencias actuales. No hay respuestas correctas y las habilidades se pueden desarrollar.
            </p>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button form="candidate-form" type="submit" size="lg">
          Continuar
          <ArrowRightIcon />
        </Button>
      </CardFooter>
    </Card>
  );
};
