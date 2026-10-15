"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2Icon, RefreshCwIcon, TrophyIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { buildAnswersPayload } from "../lib/answers";
import type { FormQuestion } from "../lib/types";
import { submitAssessment } from "../actions/form.actions";
import { ScoreBar } from "./score-bar";
import { useFormContext } from "./form-provider";

type Props = {
  questions: FormQuestion[];
};

export const PhaseResults = ({ questions }: Props) => {
  const {
    candidate,
    answers,
    results,
    setResults,
    goToPhase,
    setExistingCandidate,
  } = useFormContext();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    if (!candidate.ci || !candidate.email) {
      goToPhase(0);
      return;
    }

    setStatus("loading");
    setError(null);

    const res = await submitAssessment({
      candidate: {
        name: candidate.name,
        ci: candidate.ci,
        email: candidate.email,
      },
      answers: buildAnswersPayload(questions, answers),
    });

    if (!res.success) {
      setStatus("error");
      setError(res.errors?.[0] ?? res.message ?? "No se pudo calcular el resultado");
      return;
    }

    setResults(res.data ?? []);
    setExistingCandidate(null);
    setStatus("loading");
  }, [candidate, answers, questions, setResults, goToPhase, setExistingCandidate]);

  useEffect(() => {
    if (results.length > 0) return;
    const timeout = setTimeout(() => void submit(), 0);
    return () => clearTimeout(timeout);
  }, [submit, results.length]);

  const topCareer = useMemo(() => results[0] ?? null, [results]);

  if (status === "error")
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No pudimos calcular tus resultados</CardTitle>
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2Icon className="size-5 animate-spin text-primary" />
            Calculando tu compatibilidad
          </CardTitle>
          <CardDescription>
            Estamos procesando tus respuestas y comparándolas con cada carrera.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="h-2 w-2/3 animate-pulse rounded-full bg-muted" />
          <div className="h-2 w-1/2 animate-pulse rounded-full bg-muted" />
          <div className="h-2 w-3/5 animate-pulse rounded-full bg-muted" />
        </CardContent>
      </Card>
    );

  return (
    <div className="flex w-full flex-col gap-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="size-5 text-primary" />
            Tu mayor compatibilidad
          </CardTitle>
          <CardDescription>
            {topCareer
              ? `La carrera que mejor encaja con tu perfil es ${topCareer.careerName}.`
              : "Estos son tus resultados."}
          </CardDescription>
        </CardHeader>
        {topCareer && (
          <CardContent>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-lg font-semibold">{topCareer.careerName}</span>
              <span className="text-3xl font-bold text-primary tabular-nums">
                {topCareer.score}%
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Compatibilidad por carrera</CardTitle>
          <CardDescription>
            Porcentaje de afinidad calculado a partir de tus respuestas (1 al 100).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {results.map((career, index) => (
            <div key={career.careerId} className="flex flex-col gap-4">
              {index > 0 && <Separator />}
              <ScoreBar
                label={career.careerName}
                score={career.score}
                highlight={index === 0}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={() => goToPhase(4)}>Finalizar</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
