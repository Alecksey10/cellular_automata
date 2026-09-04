import { useAutomatonEngine } from "./engine/useAutomatonEngine";
import { AutomatonHeader } from "./AutomatonHeader";
import { ConfigPanel } from "./ConfigPanel";
import { ControlPanel } from "./ControlPanel";
import { EventLogPanel } from "./EventLogPanel";
import { Card, CardContent } from "~/components/ui/card";
import { useNavigate, useParams } from "react-router";
import { automataAPI } from "../../../api/automata";
import type { AutomataRequest } from "../../../api/automata/APIMethodGetAutomataByID";
import { useContext } from "react";
import { AuthContext } from "~/root";
import { AuthenticationState } from "~/states/auth";
import type { Route } from "./+types/AutomatonView";
import type { AutomatonGetResponse } from "../../../api/automata/types";
import { Button } from "~/components/ui/button";


export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {
    const { automatonId } = params;
    const res = await automataAPI.getAutomata.execute({automataID:automatonId} as AutomataRequest)
    
    return res.data!;
}


export default function AutomatonView({
  loaderData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const data = loaderData as AutomatonGetResponse
  const authed:AuthenticationState|null = useContext(AuthContext)
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
      {authed?.isAuth && data.owner
      ?((authed.userID as string)==(data.owner!.id.toString())?<Button onClick={()=>{navigate(`/update_automata/${automatonId}`)}}>Редактировать автомат</Button>:<></>)
      :<></>}

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
          speed={engine.speed}
          renderEveryN={engine.renderEveryN}
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