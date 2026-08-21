import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";

interface Props {
  label: string;
  description?: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function ParamSelect({
  label,
  description,
  value,
  options,
  disabled,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Select 
        value={value} 
        onValueChange={(v) => onChange(v ?? "")} // Защита от null
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}