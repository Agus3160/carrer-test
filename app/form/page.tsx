import type { Metadata } from "next";
import { Suspense } from "react";
import { FormWizard } from "@/features/form/components/form-wizard";
import { getActiveQuestions } from "@/features/form/queries/form.queries";

export const metadata: Metadata = {
  title: "Test de orientación vocacional | CheckCareer",
  description:
    "Responde el test y descubre tu porcentaje de compatibilidad con cada carrera.",
};

export default function FormPage() {
  return (
    <Suspense fallback={<div>Cargando preguntas...</div>}>
      <FormContent />
    </Suspense>
  );
}

async function FormContent() {
  const questions = await getActiveQuestions();
  return <FormWizard questions={questions} />;
}