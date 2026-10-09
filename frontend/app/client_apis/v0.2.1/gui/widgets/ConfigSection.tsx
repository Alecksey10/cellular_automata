import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface Props {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function ConfigSection({
  label,
  description,
  children,
}: Props) {
  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {label}
        </CardTitle>

        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}