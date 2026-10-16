"use client";

import { useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ListChecksIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/lib/utils";
import {
  countAnswered,
  groupByDimension,
  isAnswered,
} from "../lib/answers";
import type { FormQuestion } from "../lib/types";
import { QuestionInput } from "./question-input";
import { useFormContext } from "./form-provider";

type Props = {
  questions: FormQuestion[];
};

export const PhaseQuestions = ({ questions }: Props) => {
  const { answers, setAnswer, goToPhase } = useFormContext();
  const groups = useMemo(() => groupByDimension(questions), [questions]);
  const [dimensionIndex, setDimensionIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  const totalAnswered = countAnswered(questions, answers);
  const progress = questions.length > 0 ? (totalAnswered / questions.length) * 100 : 0;

  const goToIndex = (index: number) => {
    setDimensionIndex(index);
    setShowErrors(false);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (groups.length === 0)
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sin preguntas disponibles</CardTitle>
          <CardDescription>
            Todavía no se han configurado preguntas para el cuestionario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => goToPhase(0)}>
            Volver
          </Button>
        </CardContent>
      </Card>
    );

  const group = groups[dimensionIndex];
  const isLast = dimensionIndex === groups.length - 1;
  const dimensionComplete = group.questions.every((question) =>
    isAnswered(question, answers[question.id]),
  );

  const handleNext = () => {
    if (!dimensionComplete) {
      setShowErrors(true);
      toast.add({
        type: "error",
        description: "Elige una opción en cada pregunta. También puedes marcar que aún no lo sabes.",
      });
      return;
    }

    if (isLast) {
      goToPhase(3);
      return;
    }

    goToIndex(dimensionIndex + 1);
  };

  const handlePrevious = () => {
    if (dimensionIndex === 0) {
      goToPhase(0);
      return;
    }
    goToIndex(dimensionIndex - 1);
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <ListChecksIcon className="size-4" />
            {group.name}
          </span>
          <span className="text-muted-foreground">
            Sección {dimensionIndex + 1} de {groups.length} · {totalAnswered}/
            {questions.length} elegidas
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {group.questions.map((question) => {
        const missing = showErrors && !isAnswered(question, answers[question.id]);

        return (
          <Card key={question.id} className={cn(missing && "ring-destructive/40")}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-snug">
                  {question.text}
                </CardTitle>
                <Badge variant="outline">{question.kind === "STRENGTH" ? "Fortaleza" : question.kind === "WORK_STYLE" ? "Preferencia" : question.kind === "SUBJECT" ? "Materia" : "Interés"}</Badge>
              </div>
              {question.description && (
                <CardDescription>{question.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <QuestionInput
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswer(question.id, value)}
              />
              {missing && (
                <p className="text-sm text-destructive">
                  Elige una opción o marca que aún no lo sabes
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={handlePrevious}>
          <ArrowLeftIcon />
          {dimensionIndex === 0 ? "Volver a identificación" : "Anterior"}
        </Button>
        <Button onClick={handleNext}>
          {isLast ? "Ver mis resultados" : "Siguiente"}
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
};
