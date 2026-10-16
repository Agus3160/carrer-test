"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AnswerValue,
  AnswersMap,
  CandidateInfo,
  CareerResult,
  FormPhase,
} from "../lib/types";

const emptyCandidate: CandidateInfo = { name: "" };

type FormContextValue = {
  phase: FormPhase;
  goToPhase: (phase: FormPhase) => void;
  candidate: CandidateInfo;
  setCandidate: (candidate: CandidateInfo) => void;
  answers: AnswersMap;
  setAnswer: (questionId: number, value: AnswerValue) => void;
  results: CareerResult[];
  setResults: (results: CareerResult[]) => void;
  hasProgress: boolean;
  reset: () => void;
};

const FormContext = createContext<FormContextValue | null>(null);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [phase, setPhase] = useState<FormPhase>(0);
  const [candidate, setCandidate] = useState<CandidateInfo>(emptyCandidate);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [results, setResults] = useState<CareerResult[]>([]);

  const setAnswer = useCallback((questionId: number, value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }, []);

  const goToPhase = useCallback((next: FormPhase) => setPhase(next), []);

  const reset = useCallback(() => {
    setPhase(0);
    setCandidate(emptyCandidate);
    setAnswers({});
    setResults([]);
  }, []);

  const hasProgress = useMemo(
    () =>
      candidate.name.trim().length > 0 ||
      Object.keys(answers).length > 0,
    [candidate, answers],
  );

  const value = useMemo<FormContextValue>(
    () => ({
      phase,
      goToPhase,
      candidate,
      setCandidate,
      answers,
      setAnswer,
      results,
      setResults,
      hasProgress,
      reset,
    }),
    [
      phase,
      goToPhase,
      candidate,
      answers,
      setAnswer,
      results,
      hasProgress,
      reset,
    ],
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useFormContext = (): FormContextValue => {
  const context = useContext(FormContext);
  if (!context)
    throw new Error("useFormContext debe usarse dentro de FormProvider");
  return context;
};
