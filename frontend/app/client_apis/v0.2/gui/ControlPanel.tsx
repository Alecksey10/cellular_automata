import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Slider } from "~/components/ui/slider";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";

interface Props {
  isRunning: boolean;
  iteration: number;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onRenderIntervalChange: (n: number) => void;
}

export function ControlPanel({
  isRunning,
  iteration,
  onStart,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
  onRenderIntervalChange,
}: Props) {
  const [speed, setSpeed] = useState(1);
  const [renderEveryN, setRenderEveryN] = useState(1);

  const extractValue = (val: number | readonly number[]): number => {
    if (typeof val === "number") return val;
    if (typeof val === "object" && val !== null) {
      const first = (val as any)[0];
      if (typeof first === "number") return first;
    }
    return 1;
  };

  const handleSpeedChange = (val: number | readonly number[]) => {
    const v = extractValue(val);
    setSpeed(v);
    onSpeedChange(v);
  };

  const handleRenderIntervalChange = (val: number | readonly number[]) => {
    const v = extractValue(val);
    setRenderEveryN(v);
    onRenderIntervalChange(v);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Кнопки управления */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button variant="default" size="sm" onClick={onPause}>
              ⏸ Пауза
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={onStart}>
              ▶ Старт
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onStep}>
            ⏭ Шаг
          </Button>
          <Button variant="destructive" size="sm" onClick={onReset}>
            ↺ Сброс
          </Button>

          <div className="ml-auto">
            <Badge variant="outline">
              Итерация: {iteration.toLocaleString()}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Скорость */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Скорость</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              ×{speed.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[speed]}
            min={0.1}
            max={5}
            step={0.1}
            onValueChange={handleSpeedChange}
          />
        </div>

        {/* Интервал рендеринга */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Рендер каждые N итераций</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {renderEveryN}
            </span>
          </div>
          <Slider
            value={[renderEveryN]}
            min={1}
            max={50}
            step={1}
            onValueChange={handleRenderIntervalChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}