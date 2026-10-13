import { Skeleton } from "@/shared/components/ui/skeleton";

export const DimensionFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Skeleton className="size-7 rounded-lg" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
};
