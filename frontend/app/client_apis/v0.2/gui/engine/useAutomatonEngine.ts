import { useEffect, useRef, useState, useCallback } from "react";
import { AutomatonEngine } from "./AutomatonEngine";
import { APIMethodGetAutomataSourceByID,type AutomataSourceRequest } from "../../../../api/automata/APIMethodGetAutomataByID";
import { loadProgram } from "~/../program_loader/ProgramLoader";
import type { IAutomaton } from "../../contract/IAutomaton";
import type { ConfigSchema } from "../../contract/types/config";

export function useAutomatonEngine(automatonId: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AutomatonEngine | null>(null);

  const [program, setProgram] = useState<IAutomaton | null>(null);
  const [schema, setSchema] = useState<ConfigSchema | null>(null);
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Добавляем новые стейты для синхронизации ползунков
  const [speed, setSpeed] = useState(1);
  const [renderEveryN, setRenderEveryN] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // ЭТАП 1: Загрузка исходного кода и компиляция (только программа, без canvas)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    setProgram(null);

    async function fetchAndCompile() {
      try {
        const method = new APIMethodGetAutomataSourceByID();
        const response = await method.execute({ automataID: automatonId } as AutomataSourceRequest);

        if (!response.ok) {
          throw new Error("Не удалось загрузить исходный код автомата с сервера");
        }

        const source = await response.data!.source_code;
        const loadedProgram = (await loadProgram(source, "typescript")) as IAutomaton;

        if (ignore) {
          loadedProgram.destroy();
          return;
        }

        // Сохраняем готовую программу. Это вызовет ререндер, и canvas появится в DOM
        setProgram(loadedProgram);
        setSchema(loadedProgram.getConfigSchema());
        setParams(loadedProgram.getConfig());
        setLoading(false);
      } catch (err) {
        console.error("[useAutomatonEngine] Fetch/Compile error:", err);
        if (!ignore) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    fetchAndCompile();

    return () => {
      ignore = true;
    };
  }, [automatonId]);

  // ─────────────────────────────────────────────────────────────────────────
  // ЭТАП 2: Инициализация движка (когда программа загружена И canvas в DOM)
  // ─────────────────────────────────────────────────────────────────────────
  // Обновляем второй useEffect (инициализацию движка)
  useEffect(() => {
    if (!program || !canvasRef.current) return;

    const engine = new AutomatonEngine(
      program,
      canvasRef.current,
      {
        onIteration: (step) => setIteration(step),
        onConfigChanged: (newParams) => setParams(newParams),
        onSchemaChanged: (newSchema) => setSchema(newSchema),
        onRunningChanged: (running) => setIsRunning(running),
        
        // Синхронизируем стейт React с вызовами из автомата
        onSpeedChanged: (s) => setSpeed(s),
        onRenderEveryNChanged: (n) => setRenderEveryN(n),
      }
    );

    engineRef.current = engine;
    setIsRunning(false);
    setIteration(0);
    setSpeed(1);         // Сброс на дефолт
    setRenderEveryN(1);  // Сброс на дефолт

    engine.start();

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [program]); // Реагирует на смену программы. К этому моменту canvas уже смонтирован

  // ─────────────────────────────────────────────────────────────────────────
  // Стабильные ссылки на методы управления
  // ─────────────────────────────────────────────────────────────────────────
  const start = useCallback(() => engineRef.current?.start(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const step = useCallback(() => engineRef.current?.step(), []);
  const reset = useCallback(() => engineRef.current?.reset(), []);

  const setParam = useCallback((key: string, value: unknown) => {
    engineRef.current?.setParam(key, value);
  }, []);

  const runAction = useCallback((actionId: string) => {
    engineRef.current?.runAction(actionId);
  }, []);

  // const setSpeed = useCallback((speed: number) => {
  //   engineRef.current?.setSpeed(speed);
  // }, []);

  // const setRenderEveryN = useCallback((n: number) => {
  //   engineRef.current?.setRenderEveryN(n);
  // }, []);

  return {
    canvasRef,
    schema,
    params,
    iteration,
    isRunning,
    speed,
    renderEveryN,
    loading,
    error,
    eventBus: engineRef.current?.eventBus ?? null,
    start,
    pause,
    step,
    reset,
    setParam,
    runAction,
    setSpeed,
    setRenderEveryN,
  };
}