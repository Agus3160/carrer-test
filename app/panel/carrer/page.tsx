import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/page-header";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { CareersTable } from "@/features/career/components/careers-table";

const CareerPage = ({ searchParams }: PageProps<"/panel/carrer">) => {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title="Carreras"
        description="Administra los nombres y descripciones. Revisa las materias y sus relaciones desde la base de conocimiento."
        action={
          <Button
            size="icon"
            nativeButton={false}
            render={<Link href="/panel/carrer/new" />}
          >
            <PlusIcon />
          </Button>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <CareersTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default CareerPage;
