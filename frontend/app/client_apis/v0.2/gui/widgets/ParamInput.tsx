import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface Props {
  label: string;
  description?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function ParamInput({
  label,
  description,
  value,
  disabled,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}