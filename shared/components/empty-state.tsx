import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, icon, action }: Props) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
    {icon && <div className="text-muted-foreground [&_svg]:size-8">{icon}</div>}
    <p className="font-medium">{title}</p>
    {description && (
      <p className="text-sm text-muted-foreground">{description}</p>
    )}
    {action}
  </div>
);
