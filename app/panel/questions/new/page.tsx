import { Suspense } from "react";
import { BackLink } from "@/shared/components/back-link";
import { EntitySkeleton } from "@/shared/components/entity-skeleton";
import { QuestionForm } from "@/features/question/components/question-form";
import { getAllDimensions } from "@/features/dimension/queries/dimension.queries";

const NewQuestionPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <BackLink href="/panel/questions" />
        <h1 className="text-2xl font-semibold">Nueva pregunta</h1>
      </div>
      <Suspense fallback={<EntitySkeleton />}>
        <NewQuestionForm />
      </Suspense>
    </div>
  );
};

const NewQuestionForm = async () => {
  const dimensions = await getAllDimensions();

  return <QuestionForm dimensions={dimensions} />;
};

export default NewQuestionPage;
