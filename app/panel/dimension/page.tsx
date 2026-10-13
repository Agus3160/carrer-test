import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/page-header";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { DimensionsTable } from "@/features/dimension/components/dimensions-table";

const DimensionPage = ({ searchParams }: PageProps<"/panel/dimension">) => {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title="Dimensiones"
        description="Administra las dimensiones de evaluación de los candidatos."
        action={
          <Button
            size="icon"
            nativeButton={false}
            render={<Link href="/panel/dimension/new" />}
          >
            <PlusIcon />
          </Button>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <DimensionsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default DimensionPage;
