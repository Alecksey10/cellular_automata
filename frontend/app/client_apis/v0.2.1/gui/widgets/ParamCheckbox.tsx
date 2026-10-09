import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

interface Props {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

export function ParamCheckbox({
  label,
  description,
  checked,
  disabled,
  onChange,
}: Props) {
  return (
    <div className="flex items-start space-x-3">
      <Checkbox
        id={`param-${label}`}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange(!!v)}
      />
      <div className="space-y-1">
        <Label
          htmlFor={`param-${label}`}
          className="text-sm font-medium cursor-pointer"
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}