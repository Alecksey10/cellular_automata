import type { AutomatonEvent } from "./types/events";

/**
 * Обратная связь: автомат → RUNTIME.
 *
 * Передаётся автомату в AutomatonContext при init().
 * Автомат использует эти методы, чтобы влиять на среду исполнения
 * в ответ на внутреннюю логику.
 *
 * Примеры:
 *   - Песочница закончилась → requestPause()
 *   - Произошла ошибка → emitEvent({ type: "error", ... })
 *   - Симуляция ускорилась → requestSpeedChange(2.0)
 */
export interface IRuntimeCallback {
  /**
   * Отправить событие в RUNTIME.
   * Будет отображено в EventLogPanel.
   */
  emitEvent(event: AutomatonEvent): void;

  /**
   * Попросить RUNTIME полностью остановить симуляцию.
   * После этого loop не будет вызывать iterate().
   */
  requestStop(): void;

  /**
   * Попросить RUNTIME поставить симуляцию на паузу.
   * Отличие от stop: можно возобновить через resume().
   */
  requestPause(): void;

  /**
   * Изменить множитель скорости симуляции.
   * @param factor 1.0 = нормальная, 2.0 = вдвое быстрее, 0.5 = вдвое медленнее
   */
  requestSpeedChange(factor: number): void;

  /**
   * Изменить интервал рендеринга.
   * @param n рендерить каждые N итераций (1 = каждый кадр)
   */
  requestRenderIntervalChange(n: number): void;
}