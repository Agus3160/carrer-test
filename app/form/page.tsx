import type { Metadata } from "next";
import { Suspense } from "react";
import { FormWizard } from "@/features/form/components/form-wizard";
import { getActiveQuestions } from "@/features/form/queries/form.queries";

export const metadata: Metadata = {
  title: "Tu orientación vocacional | Brújula",
  description:
    "Comparte tus intereses y preferencias y descubre carreras que puedes explorar.",
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
