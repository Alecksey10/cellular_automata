import { Button } from "~/components/ui/button";

interface Props {
  label: string;
  description?: string;
  onClick: () => void;
}

export function ActionButton({ label, description, onClick }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      title={description}
    >
      {label}
    </Button>
  );
}