import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BackLink } from "@/shared/components/back-link";
import { EntitySkeleton } from "@/shared/components/entity-skeleton";
import { QuestionForm } from "@/features/question/components/question-form";
import { getAllDimensions } from "@/features/dimension/queries/dimension.queries";
import { getQuestionById } from "@/features/question/queries/question.queries";

type Props = PageProps<"/panel/questions/[id]/edit">;

const EditQuestionPage = ({ params }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Suspense fallback={<EntitySkeleton />}>
        <EditQuestionForm params={params} />
      </Suspense>
    </div>
  );
};

const EditQuestionForm = async ({ params }: Pick<Props, "params">) => {
  const { id } = await params;
  const questionId = Number(id);

  if (!Number.isInteger(questionId) || questionId <= 0) notFound();

  const [question, dimensions] = await Promise.all([
    getQuestionById(questionId),
    getAllDimensions(),
  ]);

  if (!question) notFound();

  return (
    <>
      <div className="flex items-center gap-2">
        <BackLink href="/panel/questions" />
        <h1 className="text-2xl font-semibold">Editar pregunta</h1>
      </div>
      <QuestionForm
        questionId={question.id}
        dimensions={dimensions}
        defaultValues={{
          text: question.text,
          description: question.description ?? "",
          dimensionId: question.dimensionId,
          type: question.type,
          options: question.options.map((option) => ({
            text: option.text,
            value: option.value,
          })),
        }}
      />
    </>
  );
};

export default EditQuestionPage;
