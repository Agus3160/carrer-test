"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SearchIcon, SparklesIcon } from "lucide-react";
import { TextField } from "@/shared/components/form-fields";
import { Badge } from "@/shared/components/ui/badge";
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
import { toast } from "@/shared/components/ui/toast";
import { findCandidate } from "../actions/form.actions";
import { useFormContext } from "./form-provider";
import { CandidateBody, CandidateSchema } from "../schemas/form.schema";
import { ScoreBar } from "./score-bar";
import { formatDateTime } from "@/shared/lib/format";

export const PhaseCandidate = () => {
  const {
    candidate,
    setCandidate,
    existingCandidate,
    setExistingCandidate,
    goToPhase,
  } = useFormContext();

  const form = useForm<CandidateBody>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: {
      name: candidate.name,
      ci: candidate.ci,
      email: candidate.email,
    },
  });

  const onSubmit = async (values: CandidateBody) => {
    const res = await findCandidate({
      name: values.name ?? "",
      ci: values.ci,
      email: values.email,
    });

    if (!res.success) {
      toast.add({
        type: "error",
        description: res.errors?.[0] ?? res.message ?? "Ocurrió un error",
      });
      return;
    }

    setCandidate({
      name: values.name ?? "",
      ci: values.ci.trim(),
      email: values.email.trim(),
    });

    if (res.data) {
      setExistingCandidate(res.data);
      toast.add({ type: "info", description: "Encontramos un registro con tus datos" });
      return;
    }

    goToPhase(1);
  };

  if (existingCandidate) {
    const { results, lastAssessmentAt } = existingCandidate;

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" />
            <CardTitle>¡Ya te encontramos!</CardTitle>
          </div>
          <CardDescription>
            Existe un candidato registrado con la cédula o el correo ingresados.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-4 text-sm">
            <span className="font-medium">{existingCandidate.name ?? "Candidato"}</span>
            <span className="text-muted-foreground">CI: {existingCandidate.ci}</span>
            <span className="text-muted-foreground">{existingCandidate.email}</span>
          </div>

          {results.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Tu último resultado</p>
                {lastAssessmentAt && (
                  <Badge variant="secondary">{formatDateTime(lastAssessmentAt)}</Badge>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {results.slice(0, 5).map((item, index) => (
                  <ScoreBar
                    key={item.careerName}
                    label={item.careerName}
                    score={item.score}
                    highlight={index === 0}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no registras resultados de un test. Puedes realizarlo ahora mismo.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Volver al inicio
          </Button>
          <Button
            onClick={() => {
              setExistingCandidate(null);
              goToPhase(1);
            }}
          >
            Realizar un nuevo test
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Identifícate</CardTitle>
        <CardDescription>
          Indícanos tus datos para buscar un registro previo y calcular tu resultado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="candidate-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-6">
            <TextField
              control={form.control}
              name="name"
              label="Nombre completo (opcional)"
              placeholder="Ej. Ana Pérez"
            />
            <TextField
              control={form.control}
              name="ci"
              label="Cédula de identidad*"
              placeholder="Ej. 12345678"
            />
            <TextField
              control={form.control}
              name="email"
              label="Correo electrónico*"
              placeholder="tucorreo@ejemplo.com"
              type="email"
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          form="candidate-form"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <SearchIcon />
              Continuar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
