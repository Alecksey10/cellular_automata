import type { IAutomaton } from "../contract/IAutomaton";
import type { IRuntimeCallback } from "../contract/IRuntimeCallback";
import type { AutomatonContext } from "../contract/types/context";
import type { AutomatonEvent } from "../contract/types/events";
import type { RenderData } from "../contract/types/render";
import { EventBus } from "./EventBus";
import { LoopController } from "./LoopController";
import { RuntimeParams } from "./RuntimeParams";

/**
 * Абстрактный базовый класс для всех версий runtime.
 *
 * Управляет жизненным циклом автомата:
 *   init → loop(iterate + render) → destroy
 *
 * Конкретные версии (RuntimeV02, ...) наследуются от него
 * и могут переопределять поведение.
 */
export abstract class BaseRuntimeProgram {
  protected automaton: IAutomaton;
  protected params: RuntimeParams;
  protected eventBus: EventBus;
  protected loop: LoopController;
  protected runtimeCallback: IRuntimeCallback;
  protected initialized = false;

  constructor(
    automaton: IAutomaton,
    eventBus: EventBus,
    paramsOverrides?: Partial<RuntimeParams>,
  ) {
    this.automaton = automaton;
    this.eventBus = eventBus;
    this.params = new RuntimeParams();

    if (paramsOverrides) {
      this.params.apply(paramsOverrides);
    }

    // Создаём callback, который автомат будет использовать
    this.runtimeCallback = this.createRuntimeCallback();

    // Создаём цикл
    this.loop = new LoopController(
      this.params,
      (ctx) => this.automaton.iterate(ctx),
      () => this.doRender(),
    );
  }

  /** Версия API, которую обслуживает этот runtime */
  abstract getApiVersion(): string;

  // ─── Управление жизненным циклом ───

  start(): void {
    if (!this.initialized) {
      this.initAutomaton();
    }

    if (this.params.paused) {
      this.loop.resume();
    } else {
      this.loop.start();
    }

    this.params.paused = false;
    this.eventBus.emit("runtime:state", "started");
  }

  pause(): void {
    this.loop.pause();
    this.params.paused = true;
    this.eventBus.emit("runtime:state", "paused");
  }

  stop(): void {
    this.loop.stop();
    this.params.paused = false;
    this.eventBus.emit("runtime:state", "stopped");
  }

  /** Одна итерация + рендер (кнопка Step) */
  step(): void {
    if (!this.initialized) {
      this.initAutomaton();
    }
    this.loop.stepOnce();
    this.eventBus.emit("iteration:tick", this.loop.currentStep);
  }

  /** Полный сброс: destroy → init → start */
  reset(): void {
    this.loop.stop();
    this.automaton.destroy();
    this.initialized = false;
    this.loop.resetStepCount();
    this.start();
  }

  destroy(): void {
    this.loop.stop();
    this.automaton.destroy();
    this.initialized = false;
  }

  // ─── Конфигурация ───

  setParam(key: string, value: unknown): void {
    const newSchema = this.automaton.setConfig({ [key]: value });
    this.eventBus.emit("config:changed", {
      key,
      value,
      newSchema,
    });

    if (newSchema) {
      // Схема изменилась — GUI должен перестроиться
      this.eventBus.emit("schema:changed", newSchema);
    }
  }

  runAction(actionId: string, payload?: unknown): void {
    this.automaton.runAction(actionId, payload);
  }

  // ─── Runtime params ───

  setSpeed(factor: number): void {
    this.params.speed = factor;
  }

  setRenderEveryN(n: number): void {
    this.params.renderEveryN = Math.max(1, n);
    
    this.eventBus.emit("runtime:render-every-n", this.params.renderEveryN);
  }

  get isRunning(): boolean {
    return this.loop.isRunning;
  }

  get currentStep(): number {
    return this.loop.currentStep;
  }

  // ─── Внутреннее ───

  protected initAutomaton(): void {
    const context: AutomatonContext = {
      gridWidth: this.params.defaultGridWidth,
      gridHeight: this.params.defaultGridHeight,
      runtime: this.runtimeCallback,
    };

    this.automaton.init(context);
    this.initialized = true;
  }

  protected doRender(): void {
    const data: RenderData | null = this.automaton.render();
    if (data) {
      this.eventBus.emit("render:data", data);
    }
    this.eventBus.emit("iteration:tick", this.loop.currentStep);
  }

  protected createRuntimeCallback(): IRuntimeCallback {
    return {
      emitEvent: (event: AutomatonEvent) => {
        this.eventBus.emit("automaton:event", event);

        // Автоматическая остановка при критической ошибке
        if (event.type === "error") {
          this.pause();
        }
      },

      requestStop: () => {
        this.stop();
      },

      requestPause: () => {
        this.pause();
      },

      requestSpeedChange: (factor: number) => {
        this.setSpeed(factor);
      },

      requestRenderIntervalChange: (n: number) => {
        this.setRenderEveryN(n);
      },
    };
  }
}