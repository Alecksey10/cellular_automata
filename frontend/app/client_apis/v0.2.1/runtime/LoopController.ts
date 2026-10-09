import type { IterationContext } from "../contract/types/context";
import type { RuntimeParams } from "./RuntimeParams";

/**
 * Управляет циклом симуляции через requestAnimationFrame.
 * Исправлена проблема пропуска кадров при медленной симуляции.
 */
export class LoopController {
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private accumulator = 0;
  private stepCount = 0;
  private running = false;

  // Глобальный трекер последнего отрендеренного шага
  private lastRenderedStep = 0;

  constructor(
    private params: RuntimeParams,
    private onTick: (ctx: IterationContext) => void,
    private onRender: () => void,
  ) {}

  get isRunning(): boolean {
    return this.running;
  }

  get currentStep(): number {
    return this.stepCount;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  /** Выполнить ровно одну итерацию (ручной шаг) */
  stepOnce(): void {
    const now = performance.now();
    this.stepCount++;
    this.onTick({
      step: this.stepCount,
      time: now,
      deltaTime: 1000 / this.params.targetFps,
    });
    
    // При ручном шаге рендерим всегда
    this.onRender();
    this.lastRenderedStep = this.stepCount;
  }

  /** Сбросить счётчик шагов */
  resetStepCount(): void {
    this.stepCount = 0;
    this.lastRenderedStep = 0;
    this.accumulator = 0;
  }

  private loop = (timestamp: number): void => {
    if (!this.running) return;

    const rawDt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Учитываем скорость симуляции
    const dt = rawDt * this.params.speed;
    this.accumulator += dt;

    const stepDuration = 1000 / this.params.targetFps;
    let iterationsThisFrame = 0;

    // 1. Выполняем накопившиеся итерации физики симуляции
    while (
      this.accumulator >= stepDuration &&
      iterationsThisFrame < this.params.maxIterationsPerFrame
    ) {
      this.stepCount++;
      this.onTick({
        step: this.stepCount,
        time: timestamp,
        deltaTime: stepDuration,
      });

      this.accumulator -= stepDuration;
      iterationsThisFrame++;
    }

    // Предотвращаем накопление отставания симуляции (защита от зависания)
    if (iterationsThisFrame >= this.params.maxIterationsPerFrame) {
      this.accumulator = 0;
    }

    // 2. РЕНДЕРИНГ: проверяем, нужно ли обновить экран в этом кадре.
    // Считаем, сколько шагов симуляции прошло с момента последнего вывода на экран.
    if (iterationsThisFrame > 0) {
      const stepsSinceLastRender = this.stepCount - this.lastRenderedStep;
      
      if (stepsSinceLastRender >= this.params.renderEveryN) {
        this.onRender();
        
        // Выравниваем шаг последнего рендера по сетке renderEveryN
        const remainder = stepsSinceLastRender % this.params.renderEveryN;
        this.lastRenderedStep = this.stepCount - remainder;
      }
    }

    this.rafId = requestAnimationFrame(this.loop);
  };
}