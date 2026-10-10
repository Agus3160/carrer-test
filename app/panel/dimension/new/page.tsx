export const instant = false;

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DimensionForm } from "@/features/dimension/components/dimension-form";

const NewDimensionPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          aria-label="Volver"
          render={<Link href="/panel/dimension" />}
        >
          <ArrowLeftIcon />
        </Button>
        <h1 className="text-2xl font-semibold">Nueva dimensión</h1>
      </div>
      <DimensionForm />
    </div>
  );
};

export default NewDimensionPage;