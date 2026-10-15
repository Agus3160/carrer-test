"use client";

import { useEffect } from "react";
import { CompassIcon } from "lucide-react";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CompassIcon className="size-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Test de orientación vocacional
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Responde con sinceridad para conocer tu compatibilidad con cada carrera.
        </p>
      </header>

      <FormProgress phase={phase} />

      {phase === 0 && <PhaseCandidate />}
      {phase === 1 && <PhaseQuestions questions={questions} />}
      {phase === 3 && <PhaseResults questions={questions} />}
      {phase === 4 && <PhaseFinish />}
    </div>
  );
};

export const FormWizard = ({ questions }: Props) => (
  <FormProvider>
    <WizardBody questions={questions} />
  </FormProvider>
);
