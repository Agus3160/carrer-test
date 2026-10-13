import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const PageHeader = ({ title, description, action }: Props) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {action}
  </div>
);
