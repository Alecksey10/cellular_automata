import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { ParamSlider } from "./widgets/ParamSlider";
import { ParamSelect } from "./widgets/ParamSelect";
import { ParamCheckbox } from "./widgets/ParamCheckbox";
import { ParamInput } from "./widgets/ParamInput";
import { ParamRadio } from "./widgets/ParamRadio";
import { ActionButton } from "./widgets/ActionButton";
import { ConfigSection } from "./widgets/ConfigSection";

import type {
  ActionDef,
  ConfigSchema,
  ConfigSectionDef,
  ParamDef,
} from "../contract/types/config";

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
  const renderParam = (key: string) => {
    const def = schema.params[key];

    if (!def) {
      return null;
    }

    const value = values[key] ?? def.default;
    const disabled = def.editable === false;

    return (
      <ParamRenderer
        key={key}
        paramKey={key}
        def={def}
        value={value}
        disabled={disabled}
        onChange={(value) => onParamChange(key, value)}
      />
    );
  };

  const renderAction = (id: string) => {
    const def = schema.actions[id];

    if (!def) {
      return null;
    }

    return (
      <ActionButton
        key={id}
        label={def.label}
        description={def.description}
        onClick={() => onAction(id)}
      />
    );
  };

  const renderActions = (ids: string[]) => {
    if (ids.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {ids.map(renderAction)}
      </div>
    );
  };

  const renderSection = (section: ConfigSectionDef): React.ReactNode => {
    const params = section.params ?? [];
    const actions = section.actions ?? [];
    const sections = section.sections ?? [];

    const hasContent =
      params.length > 0 ||
      actions.length > 0 ||
      sections.length > 0;

    if (!hasContent) {
      return null;
    }

    return (
      <ConfigSection
        key={section.id}
        label={section.label}
        description={section.description}
      >
        {params.map(renderParam)}

        {actions.length > 0 && (
          <>
            {params.length > 0 && <Separator />}
            {renderActions(actions)}
          </>
        )}

        {sections.map(renderSection)}
      </ConfigSection>
    );
  };

  const paramEntries = Object.entries(schema.params);
  const actionEntries = Object.entries(schema.actions);

  /*
   * Старый режим.
   *
   * Если sections не указаны, поведение ConfigPanel
   * остаётся практически таким же, как раньше.
   */
  if (!schema.sections || schema.sections.length === 0) {
    if (paramEntries.length === 0 && actionEntries.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Параметры
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {paramEntries.map(([key]) => renderParam(key))}

          {actionEntries.length > 0 && (
            <>
              {paramEntries.length > 0 && <Separator />}

              {renderActions(
                actionEntries.map(([id]) => id),
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  /*
   * Новый режим:
   *
   * ConfigSchema.sections представляет рекурсивное дерево GUI.
   */
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Параметры
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {schema.sections.map(renderSection)}
      </CardContent>
    </Card>
  );
}

interface ParamRendererProps {
  paramKey: string;
  def: ParamDef;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
}

function ParamRenderer({
  paramKey,
  def,
  value,
  disabled,
  onChange,
}: ParamRendererProps) {
  const label = def.label ?? paramKey;

  switch (def.ui) {
    case "scroller":
      return (
        <ParamSlider
          label={label}
          description={def.description}
          value={value as number}
          min={def.min ?? 0}
          max={def.max ?? 100}
          step={def.step ?? 1}
          disabled={disabled}
          onChange={onChange as (value: number) => void}
        />
      );

    case "combobox":
      return (
        <ParamSelect
          label={label}
          description={def.description}
          value={value as string}
          options={def.options ?? []}
          disabled={disabled}
          onChange={onChange as (value: string) => void}
        />
      );

    case "radio":
      return (
        <ParamRadio
          label={label}
          description={def.description}
          value={value as string}
          options={def.options ?? []}
          disabled={disabled}
          onChange={onChange as (value: string) => void}
        />
      );

    case "checkbox":
      return (
        <ParamCheckbox
          label={label}
          description={def.description}
          checked={value as boolean}
          disabled={disabled}
          onChange={onChange as (value: boolean) => void}
        />
      );

    case "input":
      return (
        <ParamInput
          label={label}
          description={def.description}
          value={String(value)}
          disabled={disabled}
          onChange={onChange as (value: string) => void}
        />
      );

    default:
      return null;
  }
}