import { useAutomatonEngine } from "./engine/useAutomatonEngine";
import { AutomatonHeader } from "./AutomatonHeader";
import { ConfigPanel } from "./ConfigPanel";
import { ControlPanel } from "./ControlPanel";
import { EventLogPanel } from "./EventLogPanel";
import { Card, CardContent } from "~/components/ui/card";
import { useParams } from "react-router";



export async function loader() {
    return { message: "does not do anything" };
}

export default function AutomatonView() {
  const { automatonId } = useParams();
  const engine = useAutomatonEngine(automatonId!);

  if (engine.loading) {
    return (
      <main className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Загрузка автомата…</p>
      </main>
    );
  }

  if (engine.error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Ошибка</h1>
        <p className="mt-2 text-muted-foreground">{engine.error}</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {engine.schema && <AutomatonHeader schema={engine.schema} />}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-6">
        {/* Левая колонка */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-2">
              <canvas
                ref={engine.canvasRef}
                width={600}
                height={600}
                className="w-full rounded-md bg-muted"
              />
            </CardContent>
          </Card>

          <ControlPanel
            isRunning={engine.isRunning}
            iteration={engine.iteration}
            onStart={engine.start}
            onPause={engine.pause}
            onStep={engine.step}
            onReset={engine.reset}
            onSpeedChange={engine.setSpeed}
            onRenderIntervalChange={engine.setRenderEveryN}
          />
        </div>

        {/* Правая колонка */}
        <div className="space-y-4">
          {engine.schema && (
            <ConfigPanel
              schema={engine.schema}
              values={engine.params}
              onParamChange={engine.setParam}
              onAction={engine.runAction}
            />
          )}
          <EventLogPanel eventBus={engine.eventBus} />
        </div>
      </div>
    </main>
  );
}