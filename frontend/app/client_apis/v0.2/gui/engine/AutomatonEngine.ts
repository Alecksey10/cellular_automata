import type { IAutomaton } from "../../contract/IAutomaton";
import type { ConfigSchema } from "../../contract/types/config";
import { EventBus } from "../../runtime/EventBus";
import { RuntimeV02 } from "../../runtime/RuntimeV02";
import { CanvasGridRenderer } from "../../renderers/CanvasGridRenderer";
import type { RuntimeParams } from "../../runtime/RuntimeParams";

export interface EngineCallbacks {
  /** Вызывается на каждой итерации (обновление счётчика в UI) */
  onIteration: (step: number) => void;
  /** Вызывается при изменении конфига симуляции */
  onConfigChanged: (params: Record<string, unknown>) => void;
  /** Вызывается, если автомат динамически поменял свою схему GUI */
  onSchemaChanged?: (schema: ConfigSchema) => void;
  /** Вызывается при смене состояния play/pause */
  onRunningChanged: (isRunning: boolean) => void;
  onSpeedChanged: (speed: number) => void;
  onRenderEveryNChanged: (n: number) => void;
}

/**
 * Единая точка управления симуляцией.
 * Инкапсулирует runtime, рендерер и event bus.
 */
export class AutomatonEngine {
  public readonly eventBus: EventBus;
  private runtime: RuntimeV02;
  private renderer: CanvasGridRenderer;

  constructor(
    automaton: IAutomaton,
    canvas: HTMLCanvasElement,
    callbacks: EngineCallbacks,
    paramsOverrides?: Partial<RuntimeParams>
  ) {
    this.eventBus = new EventBus();

    // 1. Инициализируем рендерер
    this.renderer = new CanvasGridRenderer(canvas);
    this.renderer.attach(this.eventBus);

    // 2. Инициализируем runtime
    this.runtime = new RuntimeV02(automaton, this.eventBus, paramsOverrides);

    // 3. Подписываемся на шину событий для проброса в React-колбэки
    this.eventBus.on("iteration:tick", (step) => {
      callbacks.onIteration(step as number);
    });

    this.eventBus.on("config:changed", () => {
      callbacks.onConfigChanged(automaton.getConfig());
    });

    this.eventBus.on("schema:changed", (schema) => {
      if (callbacks.onSchemaChanged) {
        callbacks.onSchemaChanged(schema as ConfigSchema);
      }
    });

    this.eventBus.on("runtime:state", () => {
      callbacks.onRunningChanged(this.runtime.isRunning);
    });

    this.eventBus.on("runtime:speed", (speed) => {
      callbacks.onSpeedChanged(speed as number);
    });

    this.eventBus.on("runtime:render-every-n", (n) => {
      callbacks.onRenderEveryNChanged(n as number);
    });
  }

  // ─── Фасадные методы для управления ───

  start(): void {
    this.runtime.start();
  }

  pause(): void {
    this.runtime.pause();
  }

  step(): void {
    this.runtime.step();
  }

  reset(): void {
    this.runtime.reset();
  }

  setParam(key: string, value: unknown): void {
    this.runtime.setParam(key, value);
  }

  runAction(actionId: string, payload?: unknown): void {
    this.runtime.runAction(actionId, payload);
  }

  setSpeed(factor: number): void {
    this.runtime.setSpeed(factor);
  }

  setRenderEveryN(n: number): void {
    this.runtime.setRenderEveryN(n);
  }

  destroy(): void {
    this.runtime.destroy();
    this.renderer.destroy();
    this.eventBus.clear();
  }
}