import { Badge } from "~/components/ui/badge";
import type { ConfigSchema } from "../contract/types/config";

interface Props {
  schema: ConfigSchema;
}

export function AutomatonHeader({ schema }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{schema.name}</h1>
        <Badge variant="secondary">API v{schema.apiVersion}</Badge>
      </div>
      {schema.description && (
        <p className="text-muted-foreground">{schema.description}</p>
      )}
    </div>
  );
}