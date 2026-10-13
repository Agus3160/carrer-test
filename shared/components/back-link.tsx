import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type Props = {
  href: string;
  label?: string;
};

export const BackLink = ({ href, label = "Volver" }: Props) => (
  <Button
    variant="ghost"
    size="icon-sm"
    nativeButton={false}
    aria-label={label}
    render={<Link href={href} />}
  >
    <ArrowLeftIcon />
  </Button>
);
