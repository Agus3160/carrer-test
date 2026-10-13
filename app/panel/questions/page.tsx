import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { Button } from "@/shared/components/ui/button";
import { QuestionsTable } from "@/features/question/components/questions-table";

const QuestionsPage = ({ searchParams }: PageProps<"/panel/questions">) => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Preguntas"
        description="Administra las preguntas de evaluación de los candidatos."
        action={
          <Button
            nativeButton={false}
            render={<Link href="/panel/questions/new" />}
          >
            <PlusIcon />
            Nueva pregunta
          </Button>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <QuestionsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default QuestionsPage;
