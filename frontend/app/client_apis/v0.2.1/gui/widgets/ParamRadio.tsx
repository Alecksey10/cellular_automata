import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

interface Props {
  label: string;
  description?: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function ParamRadio({
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
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-2"
      >
        {options.map((option) => {
          const id = `param-radio-${label}-${option}`;

          return (
            <div
              key={option}
              className="flex items-center space-x-2"
            >
              <RadioGroupItem
                id={id}
                value={option}
              />

              <Label
                htmlFor={id}
                className="cursor-pointer text-sm font-normal"
              >
                {option}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}