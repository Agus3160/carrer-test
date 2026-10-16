"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CompassIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { FormQuestion } from "../lib/types";
import { FormProgress } from "./form-progress";
import { FormProvider, useFormContext } from "./form-provider";
import { PhaseCandidate } from "./phase-candidate";
import { PhaseFinish } from "./phase-finish";
import { PhaseQuestions } from "./phase-questions";
import { PhaseResults } from "./phase-results";

type Props = {
  questions: FormQuestion[];
};

const WizardBody = ({ questions }: Props) => {
  const { phase, hasProgress } = useFormContext();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (phase >= 4 || !hasProgress) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase, hasProgress]);

  return (
    <main className="min-h-dvh bg-background px-4 pb-16 pt-5 sm:px-6 sm:pt-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CompassIcon className="size-5" />
            </span>
            Brújula
          </Link>
          <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
            <ArrowLeftIcon />
            Salir
          </Button>
        </header>

        <section className="animate-enter space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Orientación vocacional
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Explora carreras que conectan con lo que te interesa
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Responde a tu ritmo. Al final vas a ver por qué cada carrera se relaciona con tus intereses y preferencias.
          </p>
          <p className="max-w-2xl rounded-xl border border-primary/30 bg-card/75 px-4 py-3 text-xs leading-5 text-muted-foreground">
            Al enviar, tus respuestas se procesarán con JEV de TypeSafe para compararlas con las carreras. No enviamos el nombre opcional. Los porcentajes muestran la distribución del modelo entre estas opciones; no predicen éxito académico ni profesional.
          </p>
        </section>

        <div className="animate-enter animate-enter-delay-1"><FormProgress phase={phase} /></div>

        {phase === 0 && <div className="animate-enter animate-enter-delay-2"><PhaseCandidate /></div>}
        {phase === 1 && <PhaseQuestions questions={questions} />}
        {phase === 3 && <PhaseResults questions={questions} />}
        {phase === 4 && <PhaseFinish />}
      </div>
    </main>
  );
};

export const FormWizard = ({ questions }: Props) => (
  <FormProvider>
    <WizardBody questions={questions} />
  </FormProvider>
);
