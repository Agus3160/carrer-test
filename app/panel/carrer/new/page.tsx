import { Suspense } from "react";
import { BackLink } from "@/shared/components/back-link";
import { EntitySkeleton } from "@/shared/components/entity-skeleton";
import { CareerForm } from "@/features/career/components/career-form";
import { getAllDimensions } from "@/features/dimension/queries/dimension.queries";

const NewCareerPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <BackLink href="/panel/carrer" />
        <h1 className="text-2xl font-semibold">Nueva carrera</h1>
      </div>
      <Suspense fallback={<EntitySkeleton />}>
        <NewCareerForm />
      </Suspense>
    </div>
  );
};

const NewCareerForm = async () => {
  const dimensions = await getAllDimensions();

  return <CareerForm dimensions={dimensions} />;
};

export default NewCareerPage;
