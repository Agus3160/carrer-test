export const instant = false;

import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DimensionsTable } from "@/features/dimension/components/dimensions-table";
import { DimensionsTableSkeleton } from "@/features/dimension/components/dimensions-table-skeleton";

const DimensionPage = ({ searchParams }: PageProps<"/panel/dimension">) => {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Dimensiones</h1>
          <p className="text-sm text-muted-foreground">
            Administra las dimensiones de evaluación de los candidatos.
          </p>
        </div>
        <Button
          size="icon"
          nativeButton={false}
          render={<Link href="/panel/dimension/new" />}
        >
          <PlusIcon />
        </Button>
      </div>
      <Suspense fallback={<DimensionsTableSkeleton />}>
        <DimensionsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default DimensionPage;
