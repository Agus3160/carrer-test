"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CompassIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { buildAnswersPayload } from "../lib/answers";
import type { FormQuestion } from "../lib/types";
import { submitAssessment } from "../actions/form.actions";
import { RecommendationCard } from "./recommendation-card";
import { useFormContext } from "./form-provider";

type Props = { questions: FormQuestion[] };

export const PhaseResults = ({ questions }: Props) => {
  const { candidate, answers, results, setResults, goToPhase } = useFormContext();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const requestStarted = useRef(false);

  const submit = useCallback(async () => {
    requestStarted.current = true;
    setStatus("loading");
    setError(null);
    const res = await submitAssessment({
      candidate: { name: candidate.name },
      answers: buildAnswersPayload(questions, answers),
    });

    if (!res.success) {
      requestStarted.current = false;
      setStatus("error");
      setError(res.errors?.[0] ?? res.message ?? "No se pudieron guardar tus respuestas.");
      return;
    }

    setResults(res.data ?? []);
  }, [candidate.name, answers, questions, setResults]);

  useEffect(() => {
    if (!requestStarted.current && results.length === 0) void submit();
  }, [submit, results.length]);

  if (status === "error")
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No pudimos preparar tus recomendaciones</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" onClick={() => goToPhase(1)}>
            Revisar respuestas
          </Button>
          <Button onClick={() => void submit()}>
            <RefreshCwIcon />
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    );

  if (results.length === 0)
    return (
      <Card className="w-full border-0 bg-card/85 shadow-sm ring-1 ring-border/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2Icon className="size-5 animate-spin text-primary" />
            Comparando tus respuestas con las carreras
          </CardTitle>
          <CardDescription>
            JEV está comparando tu perfil con las carreras y sus asignaturas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-primary/15" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-3/5 animate-pulse rounded-full bg-muted" />
        </CardContent>
      </Card>
    );

  const topCareer = results[0];
  return (
    <div className="flex w-full flex-col gap-5">
      <Card className="overflow-hidden border-0 bg-[#08110c] text-foreground shadow-lg shadow-primary/5">
        <CardHeader className="gap-4 p-6 sm:p-8">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-foreground/10">
            <CompassIcon className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl text-foreground">
              {candidate.name ? `Una primera ruta para ti, ${candidate.name}` : "Una primera ruta para explorar"}
            </CardTitle>
            <CardDescription className="max-w-2xl text-primary/80">
              JEV distribuye su evaluación entre las carreras comparadas. Estos porcentajes describen esa distribución relativa; no predicen tu rendimiento ni tu éxito académico o profesional.
            </CardDescription>
          </div>
        </CardHeader>
        {topCareer && (
          <CardContent className="pb-7 pt-0 sm:px-8">
            <div className="rounded-2xl bg-card p-5 text-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Primera recomendación
              </p>
              <h2 className="mt-1 text-xl font-semibold">{topCareer.careerName}</h2>
              <p className="mt-2 text-sm font-semibold text-primary">
                Afinidad JEV {new Intl.NumberFormat("es-PY", { style: "percent", maximumFractionDigits: 1 }).format(topCareer.jevProbability)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{topCareer.summary}</p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Tu ranking de afinidad</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            La distribución de JEV reparte el 100 % entre estas opciones. Revisa también las coincidencias del catálogo, las materias y los aspectos que podrías querer explorar.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {results.map((career) => (
            <RecommendationCard key={career.careerId} career={career} />
          ))}
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/10 shadow-none">
        <CardContent className="p-5 text-sm leading-6 text-foreground">
          Esta orientación es exploratoria. Las asociaciones entre materias, actividades y preferencias laborales son preliminares y deben contrastarse con tu experiencia, información académica y conversación con orientadores.
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" nativeButton={false} render={<Link href="/carreras" />}>
          Explorar las carreras
        </Button>
        <Button onClick={() => goToPhase(4)}>
          Guardar y terminar
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
};
