import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ParamSlider } from "./widgets/ParamSlider";
import { ParamSelect } from "./widgets/ParamSelect";
import { ParamCheckbox } from "./widgets/ParamCheckbox";
import { ParamInput } from "./widgets/ParamInput";
import { ActionButton } from "./widgets/ActionButton";
import type { ConfigSchema } from "../contract/types/config";

interface Props {
  schema: ConfigSchema;
  values: Record<string, unknown>;
  onParamChange: (key: string, value: unknown) => void;
  onAction: (actionId: string) => void;
}

export function ConfigPanel({
  schema,
  values,
  onParamChange,
  onAction,
}: Props) {
  const paramEntries = Object.entries(schema.params);
  const actionEntries = Object.entries(schema.actions);

  if (paramEntries.length === 0 && actionEntries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Параметры</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paramEntries.map(([key, def]) => {
          const value = values[key] ?? def.default;
          const disabled = def.editable === false;

          switch (def.ui) {
            case "scroller":
              return (
                <ParamSlider
                  key={key}
                  label={def.label ?? key}
                  description={def.description}
                  value={value as number}
                  min={def.min ?? 0}
                  max={def.max ?? 100}
                  step={def.step ?? 1}
                  disabled={disabled}
                  onChange={(v) => onParamChange(key, v)}
                />
              );

            case "combobox":
              return (
                <ParamSelect
                  key={key}
                  label={def.label ?? key}
                  description={def.description}
                  value={value as string}
                  options={def.options ?? []}
                  disabled={disabled}
                  onChange={(v) => onParamChange(key, v)}
                />
              );

            case "radio":
              // Radio рендерим через тот же Select для компактности.
              // Если нужно именно radio — можно сделать отдельный виджет.
              return (
                <ParamSelect
                  key={key}
                  label={def.label ?? key}
                  description={def.description}
                  value={value as string}
                  options={def.options ?? []}
                  disabled={disabled}
                  onChange={(v) => onParamChange(key, v)}
                />
              );

            case "checkbox":
              return (
                <ParamCheckbox
                  key={key}
                  label={def.label ?? key}
                  description={def.description}
                  checked={value as boolean}
                  disabled={disabled}
                  onChange={(v) => onParamChange(key, v)}
                />
              );

            case "input":
              return (
                <ParamInput
                  key={key}
                  label={def.label ?? key}
                  description={def.description}
                  value={String(value)}
                  disabled={disabled}
                  onChange={(v) => onParamChange(key, v)}
                />
              );

            default:
              return null;
          }
        })}

        {actionEntries.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {actionEntries.map(([id, def]) => (
                <ActionButton
                  key={id}
                  label={def.label}
                  description={def.description}
                  onClick={() => onAction(id)}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}