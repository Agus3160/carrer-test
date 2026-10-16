import { ExternalLinkIcon } from "lucide-react";

export const SourceLink = ({
  source,
}: {
  source: { name: string; url: string; version?: string | null };
}) => (
  <a
    className="inline-flex items-center gap-1 text-primary underline decoration-primary/40 underline-offset-2 hover:text-foreground"
    href={source.url}
    target="_blank"
    rel="noreferrer"
  >
    {source.name}
    <ExternalLinkIcon className="size-3" aria-hidden="true" />
    {source.version && (
      <span className="ml-1 text-xs text-muted-foreground">{source.version}</span>
    )}
  </a>
);
