import { Slider } from "~/components/ui/slider";
import { Label } from "~/components/ui/label";

interface Props {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function ParamSlider({
  label,
  description,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: Props) {
  
  // Безопасный обработчик изменения значения
  const handleValueChange = (val: number | readonly number[]) => {
    if (typeof val === "number") {
      onChange(val);
    } else if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
      // Защита для readonly number[] массива
      const firstValue = (val as any)[0];
      if (typeof firstValue === "number") {
        onChange(firstValue);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm tabular-nums text-muted-foreground">
          {value}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={handleValueChange}
      />
    </div>
  );
}